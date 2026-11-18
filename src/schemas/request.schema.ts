import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    patientPhone: z.string().min(5, "Patient phone is required"),
    pickupAddress: z.string().min(3, "Pickup address is required"),
    destinationAddress: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  }),
});

export const updateRequestSchema = z.object({
  body: z.object({
    patientPhone: z.string().min(5, "Patient phone is required").optional(),
    pickupAddress: z.string().min(3, "Pickup address is required").optional(),
    destinationAddress: z.string().min(3, "Destination address is required").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  }),
});

export const updateRequestStatusSchema = z.object({
  body: z.object({
    requestId: z.string().uuid("Request ID must be a valid UUID"),
    status: z.string().refine(
      (val) => ["ASSIGNED", "EN_ROUTE", "PICKED_UP", "ARRIVED", "IN_TRANSIT", "COMPLETED", "CANCELLED"].includes(val),
      {
        message: "Invalid status. Expected one of ASSIGNED, EN_ROUTE, PICKED_UP, COMPLETED, CANCELLED",
      }
    ),
  }),
});

export const assignRequestSchema = z.object({
  body: z.object({
    requestId: z.string().uuid("Request ID must be a valid UUID"),
    ambulanceId: z.string().uuid("Ambulance ID must be a valid UUID"),
  }),
});
