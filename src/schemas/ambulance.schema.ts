import { z } from "zod";

export const createAmbulanceSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(1, "Vehicle number is required"),
    type: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    vehicleType: z.string().optional(),
    driverId: z.string().uuid("Driver ID must be a valid UUID").optional().nullable().or(z.literal("")),
    currentAddress: z.string().optional(),
  })
});

export const updateAmbulanceSchema = z.object({
  body: z.object({
    ambulanceId: z.string().uuid("Ambulance ID must be a valid UUID").optional(),
    status: z.string().refine(val => ["AVAILABLE", "BUSY", "MAINTENANCE"].includes(val), { 
        message: "Invalid option: expected one of AVAILABLE, BUSY, MAINTENANCE" 
    }).optional(),
    type: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    currentAddress: z.string().optional(),
    driverId: z.string().uuid("Driver ID must be a valid UUID").optional().nullable().or(z.literal("")),
  })
});

