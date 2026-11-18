import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const normalizeType = (rawType?: string): "BASIC" | "ICU" | "PEDIATRIC" => {
  if (!rawType) return "BASIC";
  const upper = rawType.toUpperCase().trim();
  if (upper === "ICU" || upper === "ALS") return "ICU";
  if (upper === "PEDIATRIC") return "PEDIATRIC";
  return "BASIC";
};

const DEFAULT_IMAGES_BY_TYPE: Record<"ICU" | "BASIC" | "PEDIATRIC", string[]> = {
  ICU: [
    "/images/icu-ambulance-exterior.jpg",
    "/images/icu-ambulance-interior.jpg",
    "/images/paramedic-team.jpg",
  ],
  BASIC: [
    "/images/bls-ambulance-exterior.jpg",
    "/images/bls-ambulance-interior.jpg",
    "/images/paramedic-team.jpg",
  ],
  PEDIATRIC: [
    "/images/pediatric-ambulance.jpg",
    "/images/icu-ambulance-interior.jpg",
    "/images/paramedic-team.jpg",
  ],
};

const DEFAULT_SPECS_BY_TYPE: Record<"ICU" | "BASIC" | "PEDIATRIC", string[]> = {
  ICU: [
    "Transport Mechanical Ventilator",
    "12-Lead Cardiac Defibrillator & Monitor",
    "Dual High-Flow Oxygen Manifolds",
    "Infusion Syringe Pumps (4-Channel)",
    "Advanced Airway & Trauma Stabilization Kit",
    "GPS Telemetry & Hospital Pre-Alert Comms",
  ],
  BASIC: [
    "Automated External Defibrillator (AED)",
    "Portable Medical Oxygen Cylinder & Masks",
    "Hydraulic Roll-In Patient Stretcher",
    "Pulse Oximetry & Vital Signs Monitor",
    "Trauma Splints & Spinal Immobilization Board",
    "Climate-Controlled Patient Cabin",
  ],
  PEDIATRIC: [
    "Neonatal & Pediatric Transport Incubator",
    "Pediatric-Calibrated Cardiac Monitor",
    "Heated Humidified Oxygen Delivery",
    "Infant & Child Airway Resuscitation Kit",
    "Low-Vibration Air-Ride Suspension",
    "Dedicated Parent Companion Seating",
  ],
};

const ambulanceInclude = {
  driver: {
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  },
  category: true,
  _count: {
    select: {
      reviews: true,
      dispatches: true,
    },
  },
};

export interface AmbulanceQueryOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const createAmbulance = async (data: any) => {
  try {
    const resolvedType = normalizeType(data.type || data.vehicleType);
    const defaultPrice = resolvedType === "ICU" ? 220 : resolvedType === "PEDIATRIC" ? 185 : 95;
    const defaultTitle =
      resolvedType === "ICU"
        ? `Mobile ICU Unit ${data.vehicleNumber.trim()}`
        : resolvedType === "PEDIATRIC"
          ? `Pediatric Care Unit ${data.vehicleNumber.trim()}`
          : `BLS Transport Unit ${data.vehicleNumber.trim()}`;

    const defaultDesc =
      resolvedType === "ICU"
        ? "Advanced critical care ambulance equipped with mechanical ventilation, multi-parameter cardiac telemetry, and ICU-certified paramedics."
        : resolvedType === "PEDIATRIC"
          ? "Specialized neonatal and pediatric emergency transport unit with temperature-stabilized incubator support and pediatric resuscitation gear."
          : "Certified Basic Life Support ambulance configured for rapid emergency transport, airway stabilization, and inter-hospital patient transfers.";

    const createData: Prisma.AmbulanceUncheckedCreateInput = {
      vehicleNumber: data.vehicleNumber.trim(),
      title: data.title?.trim() || defaultTitle,
      description: data.description?.trim() || defaultDesc,
      type: resolvedType,
      basePrice: data.basePrice !== undefined ? Number(data.basePrice) : defaultPrice,
      capacity: data.capacity !== undefined ? Number(data.capacity) : resolvedType === "ICU" ? 3 : 2,
      responseTime: data.responseTime?.trim() || (resolvedType === "ICU" ? "5-8 mins" : "7-11 mins"),
      featured: Boolean(data.featured),
      images:
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : DEFAULT_IMAGES_BY_TYPE[resolvedType],
      specifications:
        Array.isArray(data.specifications) && data.specifications.length > 0
          ? data.specifications
          : DEFAULT_SPECS_BY_TYPE[resolvedType],
      currentAddress: data.currentAddress?.trim() || "Central Medical Station",
      driverId: data.driverId && data.driverId.trim() !== "" ? data.driverId.trim() : null,
      categoryId: data.categoryId && data.categoryId.trim() !== "" ? data.categoryId.trim() : null,
    };

    return await prisma.ambulance.create({
      data: createData,
      include: ambulanceInclude,
    });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("vehicleNumber")) {
      throw Object.assign(new Error("This vehicle number is already registered."), { statusCode: 400 });
    }
    throw err;
  }
};

export const getAmbulances = async (options: AmbulanceQueryOptions) => {
  const {
    page,
    limit,
    search,
    status,
    type,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    featured,
    sortBy,
    sortOrder,
  } = options;

  const skip = (page - 1) * limit;
  const where: Prisma.AmbulanceWhereInput = { deletedAt: null };

  if (status && status !== "ALL") {
    where.status = status as any;
  }
  if (type && type !== "ALL") {
    where.type = normalizeType(type);
  }
  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }
  if (featured !== undefined) {
    where.featured = featured;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined && !isNaN(minPrice)) where.basePrice.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.basePrice.lte = maxPrice;
  }
  if (minRating !== undefined && !isNaN(minRating)) {
    where.rating = { gte: minRating };
  }
  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { vehicleNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { currentAddress: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  let orderBy: Prisma.AmbulanceOrderByWithRelationInput = { createdAt: "desc" };
  const dir: Prisma.SortOrder = sortOrder === "asc" ? "asc" : "desc";
  if (sortBy === "price") orderBy = { basePrice: dir };
  else if (sortBy === "rating") orderBy = { rating: dir };
  else if (sortBy === "title") orderBy = { title: dir };
  else if (sortBy === "newest") orderBy = { createdAt: "desc" };
  else if (sortBy === "oldest") orderBy = { createdAt: "asc" };

  const [ambulances, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: ambulanceInclude,
    }),
    prisma.ambulance.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    ambulances,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getAmbulanceById = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...ambulanceInclude,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  const related = await prisma.ambulance.findMany({
    where: {
      deletedAt: null,
      id: { not: ambulance.id },
      OR: [
        { type: ambulance.type },
        ...(ambulance.categoryId ? [{ categoryId: ambulance.categoryId }] : []),
      ],
    },
    take: 4,
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    include: ambulanceInclude,
  });

  // Fallback if fewer than 4 related of same type
  let relatedUnits = related;
  if (relatedUnits.length < 4) {
    const excludeIds = [ambulance.id, ...relatedUnits.map((r) => r.id)];
    const extra = await prisma.ambulance.findMany({
      where: { deletedAt: null, id: { notIn: excludeIds } },
      take: 4 - relatedUnits.length,
      orderBy: { rating: "desc" },
      include: ambulanceInclude,
    });
    relatedUnits = [...relatedUnits, ...extra];
  }

  return {
    ...ambulance,
    relatedUnits,
  };
};

export const updateAmbulance = async (id: string, data: any, userId: string, role: string) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  if (role === "DRIVER" && ambulance.driverId !== userId) {
    throw Object.assign(
      new Error("You are not authorized to update this ambulance because it is not assigned to you."),
      { statusCode: 403 }
    );
  }

  const updateData: Prisma.AmbulanceUncheckedUpdateInput = {};
  if (data.status) updateData.status = data.status;
  if (data.currentAddress !== undefined) updateData.currentAddress = data.currentAddress;
  if (role === "ADMIN") {
    if (data.vehicleNumber !== undefined) updateData.vehicleNumber = data.vehicleNumber.trim();
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.type || data.vehicleType) updateData.type = normalizeType(data.type || data.vehicleType);
    if (data.basePrice !== undefined) updateData.basePrice = Number(data.basePrice);
    if (data.capacity !== undefined) updateData.capacity = Number(data.capacity);
    if (data.responseTime !== undefined) updateData.responseTime = data.responseTime.trim();
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
    if (Array.isArray(data.images)) updateData.images = data.images;
    if (Array.isArray(data.specifications)) updateData.specifications = data.specifications;
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId === "" || data.categoryId === "NONE" ? null : data.categoryId;
    }
    if (data.driverId !== undefined) {
      updateData.driverId = data.driverId === "" || data.driverId === "UNASSIGNED" ? null : data.driverId;
    }
  }

  return await prisma.ambulance.update({
    where: { id },
    data: updateData,
    include: ambulanceInclude,
  });
};

export const deleteAmbulance = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const addAmbulanceReview = async (
  ambulanceId: string,
  userId: string,
  data: { rating: number; title?: string; comment: string }
) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id: ambulanceId, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ambulanceId,
        userId,
        rating: Number(data.rating),
        title: data.title?.trim() || null,
        comment: data.comment.trim(),
        verified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });

    const stats = await tx.review.aggregate({
      where: { ambulanceId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.ambulance.update({
      where: { id: ambulanceId },
      data: {
        rating: Number((stats._avg.rating || 5).toFixed(1)),
        reviewCount: stats._count.id,
      },
    });

    return review;
  });
};

export const getRecentReviews = async (limit = 6) => {
  return await prisma.review.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      ambulance: {
        select: {
          id: true,
          vehicleNumber: true,
          title: true,
          type: true,
        },
      },
    },
  });
};
