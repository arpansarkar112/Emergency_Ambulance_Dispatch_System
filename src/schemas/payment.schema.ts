import { z } from "zod";

export const adminCreatePaymentSchema = z.object({
  body: z.object({
    requestId: z.string().uuid("Request ID must be a valid UUID"),
    amount: z.number().positive("Amount must be greater than 0"),
  })
});

export const initiatePaymentSchema = z.object({
  body: z.object({
    requestId: z.string().uuid("Request ID must be a valid UUID"),
  })
});

export const paymentStatusSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid("Payment ID must be a valid UUID"),
  })
});
