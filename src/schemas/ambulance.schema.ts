import { z } from "zod";

export const createAmbulanceSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(2, "Vehicle number must be at least 2 characters"),
    title: z.string().min(2, "Unit title must be at least 2 characters").optional(),
    description: z.string().optional(),
    type: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    vehicleType: z.string().optional(),
    basePrice: z.coerce.number().min(20, "Base price must be at least $20").max(10000).optional(),
    capacity: z.coerce.number().int().min(1).max(12).optional(),
    responseTime: z.string().optional(),
    featured: z.boolean().optional(),
    images: z.array(z.string().min(1)).optional(),
    specifications: z.array(z.string().min(1)).optional(),
    categoryId: z.string().uuid("Category ID must be a valid UUID").optional().nullable().or(z.literal("")),
    driverId: z.string().uuid("Driver ID must be a valid UUID").optional().nullable().or(z.literal("")),
    currentAddress: z.string().min(2, "Station address is required").optional(),
  }),
});

export const updateAmbulanceSchema = z.object({
  body: z.object({
    ambulanceId: z.string().uuid("Ambulance ID must be a valid UUID").optional(),
    vehicleNumber: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z
      .string()
      .refine((val) => ["AVAILABLE", "BUSY", "MAINTENANCE"].includes(val), {
        message: "Invalid option: expected one of AVAILABLE, BUSY, MAINTENANCE",
      })
      .optional(),
    type: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    basePrice: z.coerce.number().min(20).max(10000).optional(),
    capacity: z.coerce.number().int().min(1).max(12).optional(),
    responseTime: z.string().optional(),
    featured: z.boolean().optional(),
    images: z.array(z.string().min(1)).optional(),
    specifications: z.array(z.string().min(1)).optional(),
    categoryId: z.string().uuid("Category ID must be a valid UUID").optional().nullable().or(z.literal("")),
    currentAddress: z.string().optional(),
    driverId: z.string().uuid("Driver ID must be a valid UUID").optional().nullable().or(z.literal("")),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    title: z.string().max(120, "Title cannot exceed 120 characters").optional(),
    comment: z.string().min(5, "Please write at least 5 characters in your review").max(1000),
  }),
});
