import { prisma } from "../lib/prisma";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          ambulances: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  // Also compute type-based fallback counts for ambulances not explicitly linked via categoryId
  const allAmbulances = await prisma.ambulance.findMany({
    where: { deletedAt: null },
    select: { id: true, type: true, categoryId: true, status: true },
  });

  return categories.map((cat) => {
    const linkedCount = allAmbulances.filter(
      (a) => a.categoryId === cat.id || (!a.categoryId && a.type === cat.ambulanceType)
    ).length;
    const availableCount = allAmbulances.filter(
      (a) =>
        a.status === "AVAILABLE" &&
        (a.categoryId === cat.id || (!a.categoryId && a.type === cat.ambulanceType))
    ).length;

    return {
      ...cat,
      unitCount: linkedCount,
      availableCount,
    };
  });
};

export const createCategory = async (data: any) => {
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
  try {
    return await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        ambulanceType: data.ambulanceType || "BASIC",
        description: data.description.trim(),
        basePriceRange: data.basePriceRange?.trim() || "$80 - $160",
        responseSla: data.responseSla?.trim() || "Under 10 mins",
        imageUrl: data.imageUrl?.trim() || "/images/bls-ambulance-exterior.jpg",
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw Object.assign(new Error("A category with that name or slug already exists."), {
        statusCode: 400,
      });
    }
    throw err;
  }
};

export const updateCategory = async (id: string, data: any) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Category not found"), { statusCode: 404 });

  const updateData: any = {};
  if (data.name !== undefined) {
    updateData.name = data.name.trim();
    if (!data.slug) updateData.slug = slugify(data.name);
  }
  if (data.slug !== undefined) updateData.slug = slugify(data.slug);
  if (data.ambulanceType !== undefined) updateData.ambulanceType = data.ambulanceType;
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.basePriceRange !== undefined) updateData.basePriceRange = data.basePriceRange.trim();
  if (data.responseSla !== undefined) updateData.responseSla = data.responseSla.trim();
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;

  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Category not found"), { statusCode: 404 });

  await prisma.ambulance.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });

  return await prisma.category.delete({ where: { id } });
};
