import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required").max(80),
    slug: z.string().min(2).max(80).optional(),
    ambulanceType: z.enum(["BASIC", "ICU", "PEDIATRIC"]).default("BASIC"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500),
    basePriceRange: z.string().min(3).max(60).optional(),
    responseSla: z.string().min(3).max(60).optional(),
    imageUrl: z.string().optional().nullable().or(z.literal("")),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    slug: z.string().min(2).max(80).optional(),
    ambulanceType: z.enum(["BASIC", "ICU", "PEDIATRIC"]).optional(),
    description: z.string().min(10).max(500).optional(),
    basePriceRange: z.string().min(3).max(60).optional(),
    responseSla: z.string().min(3).max(60).optional(),
    imageUrl: z.string().optional().nullable().or(z.literal("")),
  }),
});
