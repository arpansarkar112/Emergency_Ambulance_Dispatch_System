import { z } from "zod";

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Full name is required").max(100),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().max(30).optional().or(z.literal("")),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(160),
    category: z.string().min(2).max(60).optional(),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  }),
});

export const updateContactStatusSchema = z.object({
  body: z.object({
    status: z.enum(["NEW", "READ", "REPLIED"]),
  }),
});
