import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import config from "../config";
import { PaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-08-26.dahlia" as any,
});

export const createPaymentByAdmin = async (requestId: string, amount: number) => {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    include: { payments: { orderBy: { createdAt: "desc" } } }
  });
  if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  
  if (request.status !== "COMPLETED") {
    throw Object.assign(new Error("Payment bill can only be generated for COMPLETED requests"), { statusCode: 400 });
  }

  const paidPayment = request.payments.find(p => p.status === PaymentStatus.SUCCESS);
  if (paidPayment) {
    throw Object.assign(new Error("This request has already been paid by the patient"), { statusCode: 400 });
  }

  const existingPending = request.payments.find(p => p.status === PaymentStatus.PENDING);
  if (existingPending) {
    return await prisma.payment.update({
      where: { id: existingPending.id },
      data: { amount: Number(amount) }
    });
  }

  return await prisma.payment.create({
    data: {
      requestId,
      patientId: request.patientId,
      amount: Number(amount),
      status: PaymentStatus.PENDING,
      paymentGateway: "Stripe"
    }
  });
};

export const initiatePayment = async (patientId: string, patientEmail: string, requestId: string, originUrl?: string) => {
  const payment = await prisma.payment.findFirst({ 
    where: { requestId, status: PaymentStatus.PENDING },
    orderBy: { createdAt: "desc" }
  });
  
  if (!payment) {
    throw Object.assign(new Error("No pending payment found for this request. Please wait for admin to generate the bill."), { statusCode: 404 });
  }

  let appUrl = originUrl || config.app_url || `http://localhost:${config.port || 3000}`;
  appUrl = appUrl.replace(/\/$/, "");
  
  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    appUrl = `https://${appUrl}`;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: patientEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Ambulance Service Request #${requestId.substring(0, 8).toUpperCase()}` },
          unit_amount: Math.round(payment.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}`,
    cancel_url: `${appUrl}/payment/cancel`,
    metadata: { requestId, patientId, paymentId: payment.id }
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { transactionId: session.id }
  });

  return { url: session.url, sessionId: session.id, paymentId: payment.id };
};

export const getAllPayments = async (userId: string, role: string) => {
  const where = role === "PATIENT" ? { patientId: userId } : {};
  return await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { request: true }
  });
};

export const handleWebhook = async (payload: any, signature: string) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    throw Object.assign(new Error(`Webhook Error: ${err.message}`), { statusCode: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    await prisma.payment.updateMany({
      where: { transactionId: session.id },
      data: { status: PaymentStatus.SUCCESS }
    });
  }

  return true;
};

export const getPaymentStatus = async (id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw Object.assign(new Error("Payment not found"), { statusCode: 404 });
  return payment;
};

export const verifySession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === 'paid' || session.status === 'complete') {
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await prisma.payment.updateMany({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS, transactionId: sessionId }
      });
    }
    await prisma.payment.updateMany({
      where: { transactionId: sessionId },
      data: { status: PaymentStatus.SUCCESS }
    });
  }
  
  return await prisma.payment.findFirst({
    where: {
      OR: [
        { transactionId: sessionId },
        ...(session.metadata?.paymentId ? [{ id: session.metadata.paymentId }] : [])
      ]
    }
  });
};
