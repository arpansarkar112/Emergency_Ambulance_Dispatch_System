import { z } from "zod";

export const changeRoleSchema = z.object({
  body: z.object({
    userId: z.number().int("User ID is required"),
    role: z.enum(["ADMIN", "PATIENT", "DRIVER"]),
  })
});
