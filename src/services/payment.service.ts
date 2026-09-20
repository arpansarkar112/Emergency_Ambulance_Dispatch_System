import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import config from "../config";
import { PaymentStatus } from "../../generated/prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

export const initiatePayment = async (patientId: number, requestId: number, amount: number) => {
  const request = await prisma.emergencyRequest.findFirst({ where: { id: requestId, patientId } });
  if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Ambulance Service Request #${requestId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: { requestId: requestId.toString(), patientId: patientId.toString() }
  });

  await prisma.payment.create({
    data: {
      requestId,
      patientId,
      amount,
      transactionId: session.id,
      status: PaymentStatus.PENDING,
      paymentGateway: "Stripe"
    }
  });

  return { url: session.url, sessionId: session.id };
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

export const getPaymentStatus = async (id: number) => {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw Object.assign(new Error("Payment not found"), { statusCode: 404 });
  return payment;
};
