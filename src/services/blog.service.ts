import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getBlogs = async (page = 1, limit = 12, search?: string, category?: string) => {
  const skip = (page - 1) * limit;
  const where: Prisma.BlogPostWhereInput = { published: true };

  if (category && category !== "ALL") {
    where.category = { equals: category, mode: "insensitive" };
  }
  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getBlogBySlug = async (slug: string) => {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) throw Object.assign(new Error("Article not found"), { statusCode: 404 });

  const related = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return { ...post, related };
};

export const createBlog = async (data: any) => {
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  return await prisma.blogPost.create({
    data: {
      slug,
      title: data.title.trim(),
      excerpt: data.excerpt.trim(),
      content: data.content.trim(),
      category: data.category.trim(),
      authorName: data.authorName.trim(),
      authorRole: data.authorRole?.trim() || "Clinical Dispatch Editor",
      coverImage: data.coverImage.trim(),
      readTime: data.readTime?.trim() || "5 min read",
      published: data.published ?? true,
    },
  });
};

export const updateBlog = async (id: string, data: any) => {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Article not found"), { statusCode: 404 });

  return await prisma.blogPost.update({
    where: { id },
    data,
  });
};

export const deleteBlog = async (id: string) => {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Article not found"), { statusCode: 404 });

  return await prisma.blogPost.delete({ where: { id } });
};
