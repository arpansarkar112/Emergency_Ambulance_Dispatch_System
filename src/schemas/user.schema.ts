import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name cannot be empty").max(80).optional(),
    lastName: z.string().min(1, "Last name cannot be empty").max(80).optional(),
    phone: z.string().max(30).optional().or(z.literal("")),
    address: z.string().max(240).optional().or(z.literal("")),
    avatarUrl: z.string().max(500000).optional().nullable().or(z.literal("")),
    emergencyContact: z.string().max(60).optional().or(z.literal("")),
    bloodGroup: z.string().max(10).optional().or(z.literal("")),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must include an uppercase letter")
      .regex(/[a-z]/, "New password must include a lowercase letter")
      .regex(/[0-9]/, "New password must include a number"),
  }),
});
