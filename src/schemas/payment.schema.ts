import { z } from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    requestId: z.string().uuid("Request ID must be a valid UUID"),
    amount: z.number().positive("Amount must be greater than 0"),
  })
});
