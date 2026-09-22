import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import config from "../config";
import { PaymentStatus } from "../../generated/prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia" as any,
});

export const createPaymentByAdmin = async (requestId: string, amount: number) => {
  const request = await prisma.emergencyRequest.findUnique({ where: { id: requestId } });
  if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  
  if (request.status !== "COMPLETED") {
    throw Object.assign(new Error("Payment bill can only be generated for COMPLETED requests"), { statusCode: 400 });
  }

  return await prisma.payment.create({
    data: {
      requestId,
      patientId: request.patientId,
      amount,
      status: PaymentStatus.PENDING,
      paymentGateway: "Stripe"
    }
  });
};

export const initiatePayment = async (patientId: string, patientEmail: string, requestId: string) => {
  const payment = await prisma.payment.findFirst({ 
    where: { requestId, patientId, status: PaymentStatus.PENDING } 
  });
  
  if (!payment) {
    throw Object.assign(new Error("No pending payment found for this request. Please wait for admin to generate the bill."), { statusCode: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: patientEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Ambulance Service Request #${requestId}` },
          unit_amount: Math.round(payment.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: { requestId, patientId, paymentId: payment.id }
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { transactionId: session.id }
  });

  return { url: session.url, sessionId: session.id, paymentId: payment.id };
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
  if (session.payment_status === 'paid') {
    await prisma.payment.updateMany({
      where: { transactionId: sessionId },
      data: { status: PaymentStatus.SUCCESS }
    });
  }
  
  return await prisma.payment.findFirst({ where: { transactionId: sessionId } });
};
