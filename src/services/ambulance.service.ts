import { prisma } from "../lib/prisma";

export const createAmbulance = async (data: any) => {
  try {
    return await prisma.ambulance.create({ data });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("vehicleNumber")) {
      throw Object.assign(new Error("This vehicle is already registered."), { statusCode: 400 });
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
      include: { driver: { select: { id: true, email: true, profile: true } } }
    }),
    prisma.ambulance.count({ where })
  ]);

  return { ambulances, total };
};

export const getAmbulanceById = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
    include: { driver: { select: { id: true, profile: true } } }
  });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });
  return ambulance;
};

export const updateAmbulance = async (id: string, data: any) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.ambulance.update({
    where: { id },
    data
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
