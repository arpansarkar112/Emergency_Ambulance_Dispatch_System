import { z } from "zod";

export const changeRoleSchema = z.object({
  body: z.object({
    userId: z.string().uuid("User ID must be a valid UUID"),
    role: z.string().refine(val => ["ADMIN", "PATIENT", "DRIVER"].includes(val), {
      message: "Role must be ADMIN, PATIENT, or DRIVER"
    }),
  })
});
