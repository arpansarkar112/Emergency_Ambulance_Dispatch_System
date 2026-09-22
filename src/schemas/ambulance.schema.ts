import { z } from "zod";

export const createAmbulanceSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(1, "Vehicle number is required"),
    type: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    driverId: z.number().int().optional(),
    currentLat: z.number().optional(),
    currentLng: z.number().optional(),
  })
});

export const updateAmbulanceSchema = z.object({
  body: z.object({
    ambulanceId: z.number().int("Ambulance ID is required"),
    status: z.enum(["AVAILABLE", "BUSY", "MAINTENANCE"]).optional(),
    currentLat: z.number().optional(),
    currentLng: z.number().optional(),
    driverId: z.number().int().optional(),
  })
});
