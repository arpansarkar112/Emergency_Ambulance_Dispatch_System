import { z } from "zod";

export const changeRoleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "PATIENT", "DRIVER"]),
  })
});
