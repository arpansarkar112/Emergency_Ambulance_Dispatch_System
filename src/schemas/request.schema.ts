import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    patientPhone: z.string().min(1, "Patient phone is required"),
    pickupLat: z.number(),
    pickupLng: z.number(),
    destinationLat: z.number().optional(),
    destinationLng: z.number().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  })
});

export const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ASSIGNED", "EN_ROUTE", "PICKED_UP", "COMPLETED", "CANCELLED"]),
  })
});

export const assignRequestSchema = z.object({
  body: z.object({
    ambulanceId: z.number().int(),
  })
});
