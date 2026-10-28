import { prisma } from "../lib/prisma";

const normalizeType = (rawType?: string): "BASIC" | "ICU" | "PEDIATRIC" => {
  if (!rawType) return "BASIC";
  const upper = rawType.toUpperCase().trim();
  if (upper === "ICU" || upper === "ALS") return "ICU";
  if (upper === "PEDIATRIC") return "PEDIATRIC";
  return "BASIC";
};

export const createAmbulance = async (data: any) => {
  try {
    const createData: any = {
      vehicleNumber: data.vehicleNumber.trim(),
      type: normalizeType(data.type || data.vehicleType),
      currentAddress: data.currentAddress?.trim() || "Central Station",
      driverId: data.driverId && data.driverId.trim() !== "" ? data.driverId.trim() : null,
    };

    return await prisma.ambulance.create({
      data: createData,
      include: { driver: { select: { id: true, email: true, role: true, profile: true } } }
    });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("vehicleNumber")) {
      throw Object.assign(new Error("This vehicle number is already registered."), { statusCode: 400 });
    }
    throw err;
  }
};

export const getAmbulances = async (page: number, limit: number, status?: string) => {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as any, deletedAt: null } : { deletedAt: null };

  const [ambulances, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { driver: { select: { id: true, email: true, role: true, profile: true } } }
    }),
    prisma.ambulance.count({ where })
  ]);

  return { ambulances, total };
};

export const getAmbulanceById = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
    include: { driver: { select: { id: true, email: true, role: true, profile: true } } }
  });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });
  return ambulance;
};

export const updateAmbulance = async (id: string, data: any, userId: string, role: string) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  if (role === "DRIVER" && ambulance.driverId !== userId) {
    throw Object.assign(new Error("You are not authorized to update this ambulance because it is not assigned to you."), { statusCode: 403 });
  }

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.currentAddress !== undefined) updateData.currentAddress = data.currentAddress;
  if (data.type || data.vehicleType) updateData.type = normalizeType(data.type || data.vehicleType);
  if (data.driverId !== undefined) {
    updateData.driverId = data.driverId === "" || data.driverId === "UNASSIGNED" ? null : data.driverId;
  }

  return await prisma.ambulance.update({
    where: { id },
    data: updateData,
    include: { driver: { select: { id: true, email: true, role: true, profile: true } } }
  });
};

export const deleteAmbulance = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
