import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import config from "../config";
import { Prisma } from "@prisma/client";

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      profile: true,
      createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

export const updateMyProfile = async (userId: string, data: any) => {
  const cleanData: any = {};
  if (data.firstName !== undefined) cleanData.firstName = data.firstName;
  if (data.lastName !== undefined) cleanData.lastName = data.lastName;
  if (data.phone !== undefined) cleanData.phone = data.phone;
  if (data.address !== undefined) cleanData.address = data.address;
  if (data.avatarUrl !== undefined) cleanData.avatarUrl = data.avatarUrl || null;
  if (data.emergencyContact !== undefined) cleanData.emergencyContact = data.emergencyContact;
  if (data.bloodGroup !== undefined) cleanData.bloodGroup = data.bloodGroup;

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: cleanData,
    create: {
      userId,
      ...cleanData,
    },
  });
  return profile;
};

export const changeMyPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  if (!user.password) {
    throw Object.assign(
      new Error("Accounts signed in via Google cannot change a local password."),
      { statusCode: 400 }
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw Object.assign(new Error("Current password is incorrect."), { statusCode: 400 });
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { updated: true };
};

export const getAllUsers = async (
  page: number,
  limit: number,
  role?: string,
  search?: string,
  includeDisabled = false
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.UserWhereInput = includeDisabled ? {} : { deletedAt: null };

  if (role && role !== "ALL") {
    where.role = role as any;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { profile: { firstName: { contains: q, mode: "insensitive" } } },
      { profile: { lastName: { contains: q, mode: "insensitive" } } },
      { profile: { phone: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        deletedAt: true,
        profile: true,
        _count: {
          select: {
            requests: true,
            dispatches: true,
            ambulances: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const toggleUserStatus = async (userId: string, active: boolean, actorId: string) => {
  if (userId === actorId) {
    throw Object.assign(new Error("You cannot disable your own administrator account."), {
      statusCode: 400,
    });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  return await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: active ? null : new Date() },
    select: { id: true, email: true, role: true, deletedAt: true },
  });
};
