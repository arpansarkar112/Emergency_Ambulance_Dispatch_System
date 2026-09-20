import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/client";

export const getDashboardStats = async () => {
  const [totalUsers, totalAmbulances, totalRequests, totalRevenue] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.ambulance.count({ where: { deletedAt: null } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" }
    })
  ]);

  return {
    totalUsers,
    totalAmbulances,
    totalRequests,
    totalRevenue: totalRevenue._sum.amount || 0
  };
};

export const changeUserRole = async (userId: number, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true }
  });
};

export const getAuditLogs = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } }
    }),
    prisma.auditLog.count()
  ]);

  return { logs, total, page, limit };
};
