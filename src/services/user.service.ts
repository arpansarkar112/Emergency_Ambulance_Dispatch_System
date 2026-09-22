import { prisma } from "../lib/prisma";

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      profile: true,
      createdAt: true
    }
  });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

export const updateMyProfile = async (userId: string, data: any) => {
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data
    }
  });
  return profile;
};

export const getAllUsers = async (page: number, limit: number, role?: string) => {
  const skip = (page - 1) * limit;
  const where = role ? { role: role as any, deletedAt: null } : { deletedAt: null };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: { id: true, email: true, role: true, profile: true }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total, page, limit };
};
