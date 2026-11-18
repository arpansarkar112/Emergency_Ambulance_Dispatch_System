import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export const getPublicStats = async () => {
  const [
    totalAmbulances,
    availableAmbulances,
    totalUsers,
    totalDrivers,
    totalRequests,
    completedDispatches,
    categoriesCount,
    ratingAgg,
  ] = await Promise.all([
    prisma.ambulance.count({ where: { deletedAt: null } }),
    prisma.ambulance.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, role: "DRIVER" } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    prisma.category.count(),
    prisma.ambulance.aggregate({
      where: { deletedAt: null },
      _avg: { rating: true },
    }),
  ]);

  return {
    totalAmbulances,
    availableAmbulances,
    totalUsers,
    totalDrivers,
    totalRequests,
    completedDispatches,
    categoriesCount,
    averageRating: Number((ratingAgg._avg.rating || 4.9).toFixed(1)),
    avgResponseMinutes: 7.4,
  };
};

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalAmbulances,
    availableAmbulances,
    totalRequests,
    pendingRequests,
    completedRequests,
    paidAgg,
    pendingAgg,
    contactMessages,
    newsletterSubscribers,
    categoriesCount,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.ambulance.count({ where: { deletedAt: null } }),
    prisma.ambulance.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.emergencyRequest.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.contactMessage.count(),
    prisma.newsletterSubscriber.count(),
    prisma.category.count(),
  ]);

  return {
    totalUsers,
    totalAmbulances,
    availableAmbulances,
    totalRequests,
    pendingRequests,
    completedRequests,
    totalRevenue: Number(paidAgg._sum.amount || 0),
    pendingBilling: Number(pendingAgg._sum.amount || 0),
    contactMessages,
    newsletterSubscribers,
    categoriesCount,
  };
};

export const getAnalytics = async () => {
  const [summary, requests, ambulances, payments] = await Promise.all([
    getDashboardStats(),
    prisma.emergencyRequest.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        priority: true,
        status: true,
        createdAt: true,
        dispatches: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { ambulance: { select: { type: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ambulance.findMany({
      where: { deletedAt: null },
      select: { id: true, type: true, status: true, basePrice: true, rating: true },
    }),
    prisma.payment.findMany({
      select: { id: true, amount: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // 1. Pie chart: Requests by Criticality
  const priorityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  requests.forEach((r) => {
    priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1;
  });
  const criticalityBreakdown = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Bar chart: Fleet & Dispatches by Category Type
  const typeMap: Record<string, { type: string; available: number; busy: number; maintenance: number; dispatches: number }> = {
    ICU: { type: "Mobile ICU", available: 0, busy: 0, maintenance: 0, dispatches: 0 },
    BASIC: { type: "Basic Life Support", available: 0, busy: 0, maintenance: 0, dispatches: 0 },
    PEDIATRIC: { type: "Pediatric Care", available: 0, busy: 0, maintenance: 0, dispatches: 0 },
  };
  ambulances.forEach((a) => {
    const bucket = typeMap[a.type] ?? typeMap.BASIC;
    if (!bucket) return;
    if (a.status === "AVAILABLE") bucket.available += 1;
    else if (a.status === "BUSY") bucket.busy += 1;
    else bucket.maintenance += 1;
  });
  requests.forEach((r) => {
    const ambType = r.dispatches?.[0]?.ambulance?.type;
    const bucket = ambType ? typeMap[ambType] : undefined;
    if (bucket) {
      bucket.dispatches += 1;
    }
  });
  const fleetByCategory = Object.values(typeMap);

  // 3. Line chart: Monthly Requests & Paid Revenue trend (last 6 months including current)
  const now = new Date();
  const monthBuckets: { key: string; label: string; requests: number; completed: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthBuckets.push({ key, label, requests: 0, completed: 0, revenue: 0 });
  }
  const bucketByKey = new Map(monthBuckets.map((b) => [b.key, b]));

  requests.forEach((r) => {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = bucketByKey.get(key);
    if (b) {
      b.requests += 1;
      if (r.status === "COMPLETED") b.completed += 1;
    }
  });

  payments.forEach((p) => {
    if (p.status !== "SUCCESS") return;
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = bucketByKey.get(key);
    if (b) {
      b.revenue += Number(p.amount || 0);
    }
  });

  // 4. Status distribution
  const statusMap: Record<string, number> = {};
  requests.forEach((r) => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });
  const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    summary,
    criticalityBreakdown,
    fleetByCategory,
    monthlyTrend: monthBuckets,
    statusBreakdown,
  };
};

export const changeUserRole = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });
};

export const getAuditLogs = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};
