import { prisma } from "../lib/prisma";

export const createAmbulance = async (data: any) => {
  return await prisma.ambulance.create({ data });
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

  return { ambulances, total, page, limit };
};

export const getAmbulanceById = async (id: number) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, deletedAt: null },
    include: { driver: { select: { id: true, profile: true } } }
  });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });
  return ambulance;
};

export const updateAmbulance = async (id: number, data: any) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.ambulance.update({
    where: { id },
    data
  });
};

export const deleteAmbulance = async (id: number) => {
  const ambulance = await prisma.ambulance.findFirst({ where: { id, deletedAt: null } });
  if (!ambulance) throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });

  return await prisma.ambulance.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};
