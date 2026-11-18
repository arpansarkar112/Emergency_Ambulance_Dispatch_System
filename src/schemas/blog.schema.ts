import { z } from "zod";

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    slug: z.string().min(3).max(200).optional(),
    excerpt: z.string().min(15, "Excerpt must be at least 15 characters").max(500),
    content: z.string().min(40, "Content must be at least 40 characters"),
    category: z.string().min(2, "Category is required").max(60),
    authorName: z.string().min(2, "Author name is required").max(80),
    authorRole: z.string().min(2).max(100).optional(),
    coverImage: z.string().min(1, "Cover image is required"),
    readTime: z.string().optional(),
    published: z.boolean().optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    excerpt: z.string().min(15).max(500).optional(),
    content: z.string().min(40).optional(),
    category: z.string().min(2).max(60).optional(),
    authorName: z.string().min(2).max(80).optional(),
    authorRole: z.string().min(2).max(100).optional(),
    coverImage: z.string().optional(),
    readTime: z.string().optional(),
    published: z.boolean().optional(),
  }),
});
