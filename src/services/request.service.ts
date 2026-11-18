import { prisma } from "../lib/prisma";
import { RequestStatus, AmbulanceStatus, DispatchStatus } from "@prisma/client";

const requestInclude = {
  patient: { select: { id: true, email: true, profile: true } },
  dispatches: {
    orderBy: { createdAt: "desc" as const },
    include: {
      ambulance: true,
      driver: { select: { id: true, email: true, profile: true } }
    }
  },
  payments: {
    orderBy: { createdAt: "desc" as const }
  }
};

export const formatRequest = (req: any) => {
  if (!req) return req;
  const payments = Array.isArray(req.payments) ? req.payments : [];
  const activePayment =
    payments.find((p: any) => p.status === "SUCCESS") ||
    payments.find((p: any) => p.status === "PENDING") ||
    payments[0] ||
    null;

  const dispatches = Array.isArray(req.dispatches) ? req.dispatches : [];
  const latestDispatch = dispatches[0] || null;

  return {
    ...req,
    payment: activePayment,
    amount: activePayment?.amount || 0,
    paymentStatus: activePayment?.status || "UNBILLED",
    dispatch: latestDispatch,
    ambulance: latestDispatch?.ambulance || null,
    ambulanceId: latestDispatch?.ambulanceId || null,
    driver: latestDispatch?.driver || null,
  };
};

export const createEmergencyRequest = async (patientId: string, data: any) => {
  const created = await prisma.emergencyRequest.create({
    data: {
      patientId,
      patientPhone: data.patientPhone,
      pickupAddress: data.pickupAddress,
      destinationAddress: data.destinationAddress || "Nearest Hospital",
      priority: data.priority || "MEDIUM",
    },
    include: requestInclude
  });
  return formatRequest(created);
};

export const getRequests = async (page: number, limit: number, status?: string) => {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as any, deletedAt: null } : { deletedAt: null };

  const [requests, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: requestInclude
    }),
    prisma.emergencyRequest.count({ where })
  ]);

  return { requests: requests.map(formatRequest), total };
};

export const getRequestsByDriver = async (driverId: string) => {
  const requests = await prisma.emergencyRequest.findMany({
    where: { 
      deletedAt: null,
      dispatches: { some: { driverId } }
    },
    orderBy: { createdAt: "desc" },
    include: requestInclude
  });
  return requests.map(formatRequest);
};

export const getRequestsByPatient = async (patientId: string) => {
  const requests = await prisma.emergencyRequest.findMany({
    where: {
      deletedAt: null,
      patientId
    },
    orderBy: { createdAt: "desc" },
    include: requestInclude
  });
  return requests.map(formatRequest);
};

export const getRequestById = async (id: string) => {
  const request = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
    include: requestInclude
  });
  if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  return formatRequest(request);
};

// TRANSACTION LOGIC
export const assignAmbulance = async (requestId: string, ambulanceId: string, adminId: string) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findFirst({ where: { id: requestId, deletedAt: null } });
    if (!request || request.status !== RequestStatus.PENDING) {
      throw Object.assign(new Error("Request is either not found or already assigned/processed"), { statusCode: 400 });
    }

    const ambulance = await tx.ambulance.findFirst({
      where: { id: ambulanceId, deletedAt: null }
    });
    if (!ambulance) {
      throw Object.assign(new Error("Ambulance not found"), { statusCode: 404 });
    }
    if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
      throw Object.assign(new Error(`Ambulance ${ambulance.vehicleNumber} is currently ${ambulance.status}`), { statusCode: 400 });
    }
    if (!ambulance.driverId) {
      throw Object.assign(new Error(`Ambulance ${ambulance.vehicleNumber} has no driver assigned. Please assign a driver first.`), { statusCode: 400 });
    }

    if ((request.priority === "HIGH" || request.priority === "CRITICAL") && ambulance.type !== "ICU") {
      throw Object.assign(new Error("High and Critical priority requests require an ICU ambulance"), { statusCode: 400 });
    }

    if ((request.priority === "LOW" || request.priority === "MEDIUM") && ambulance.type !== "BASIC") {
      throw Object.assign(new Error("Low and Medium priority requests require a BASIC ambulance"), { statusCode: 400 });
    }

    // Assign and update status
    await tx.emergencyRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.ASSIGNED }
    });

    await tx.ambulance.update({
      where: { id: ambulanceId },
      data: { status: AmbulanceStatus.BUSY }
    });

    const dispatch = await tx.dispatch.create({
      data: {
        requestId,
        ambulanceId,
        driverId: ambulance.driverId,
        status: DispatchStatus.PENDING
      }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: "ASSIGN_AMBULANCE",
        entity: "EmergencyRequest",
        entityId: requestId,
        details: JSON.stringify({ ambulanceId, driverId: ambulance.driverId, priority: request.priority, ambulanceType: ambulance.type })
      }
    });

    const updatedRequest = await tx.emergencyRequest.findFirst({
      where: { id: requestId },
      include: requestInclude
    });

    return { request: formatRequest(updatedRequest), dispatch };
  });
};

export const updateStatus = async (id: string, rawStatus: string, driverId: string) => {
  const normalizedStatus: RequestStatus =
    rawStatus === "ARRIVED" || rawStatus === "IN_TRANSIT"
      ? RequestStatus.PICKED_UP
      : (rawStatus as RequestStatus);

  return await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findFirst({
      where: { id, deletedAt: null },
      include: { dispatches: { where: { driverId }, take: 1, orderBy: { createdAt: 'desc' } } }
    });

    if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
    if (request.dispatches.length === 0) throw Object.assign(new Error("You are not assigned to this request"), { statusCode: 403 });

    const activeDispatch = request.dispatches[0];

    await tx.emergencyRequest.update({
      where: { id },
      data: { status: normalizedStatus }
    });

    // Update Dispatch status and timestamps, and free the ambulance when completed or cancelled
    if (activeDispatch) {
      const dispatchUpdate: any = {};
      if (normalizedStatus === RequestStatus.EN_ROUTE) {
        dispatchUpdate.status = DispatchStatus.EN_ROUTE;
      } else if (normalizedStatus === RequestStatus.PICKED_UP) {
        dispatchUpdate.status = DispatchStatus.EN_ROUTE;
        if (!activeDispatch.arrivalTime) dispatchUpdate.arrivalTime = new Date();
      } else if (normalizedStatus === RequestStatus.COMPLETED) {
        dispatchUpdate.status = DispatchStatus.COMPLETED;
        dispatchUpdate.completionTime = new Date();
      } else if (normalizedStatus === RequestStatus.CANCELLED) {
        dispatchUpdate.status = DispatchStatus.CANCELLED;
      }

      if (Object.keys(dispatchUpdate).length > 0) {
        await tx.dispatch.update({
          where: { id: activeDispatch.id },
          data: dispatchUpdate
        });
      }

      if (normalizedStatus === RequestStatus.COMPLETED || normalizedStatus === RequestStatus.CANCELLED) {
        await tx.ambulance.update({
          where: { id: activeDispatch.ambulanceId },
          data: { status: AmbulanceStatus.AVAILABLE }
        });
      }
    }

    // Log status transitions
    await tx.auditLog.create({
      data: {
        userId: driverId,
        action: "STATUS_UPDATE",
        entity: "EmergencyRequest",
        entityId: id,
        details: JSON.stringify({ status: normalizedStatus })
      }
    });

    const updated = await tx.emergencyRequest.findFirst({
      where: { id },
      include: requestInclude
    });

    return formatRequest(updated);
  });
};

export const cancelRequest = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findFirst({
      where: { id },
      include: { dispatches: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    if (request?.dispatches?.[0]) {
      const d = request.dispatches[0];
      await tx.dispatch.update({
        where: { id: d.id },
        data: { status: DispatchStatus.CANCELLED }
      });
      await tx.ambulance.update({
        where: { id: d.ambulanceId },
        data: { status: AmbulanceStatus.AVAILABLE }
      });
    }

    return await tx.emergencyRequest.update({
      where: { id },
      data: { deletedAt: new Date(), status: RequestStatus.CANCELLED }
    });
  });
};

export const updatePatientRequest = async (id: string, patientId: string, data: any) => {
  const existing = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  if (existing.patientId !== patientId) {
    throw Object.assign(new Error("You are not authorized to edit this request."), { statusCode: 403 });
  }
  if (existing.status !== RequestStatus.PENDING) {
    throw Object.assign(new Error("Only pending requests can be edited before ambulance dispatch."), {
      statusCode: 400,
    });
  }

  const updated = await prisma.emergencyRequest.update({
    where: { id },
    data: {
      ...(data.patientPhone ? { patientPhone: data.patientPhone.trim() } : {}),
      ...(data.pickupAddress ? { pickupAddress: data.pickupAddress.trim() } : {}),
      ...(data.destinationAddress ? { destinationAddress: data.destinationAddress.trim() } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
    },
    include: requestInclude,
  });

  return formatRequest(updated);
};

export const getMyStats = async (userId: string, role: string) => {
  const requests =
    role === "DRIVER"
      ? await getRequestsByDriver(userId)
      : await getRequestsByPatient(userId);

  const totalRequests = requests.length;
  const activeRequests = requests.filter(
    (r: any) => !["COMPLETED", "CANCELLED"].includes(r.status)
  ).length;
  const completedRequests = requests.filter((r: any) => r.status === "COMPLETED").length;

  const totalPaid = requests.reduce((sum: number, r: any) => {
    const isPaid = r.payment?.status === "SUCCESS" || r.paymentStatus === "SUCCESS";
    return sum + (isPaid ? Number(r.amount || 0) : 0);
  }, 0);

  const pendingAmount = requests.reduce((sum: number, r: any) => {
    const isPaid = r.payment?.status === "SUCCESS" || r.paymentStatus === "SUCCESS";
    return sum + (!isPaid && Number(r.amount || 0) > 0 ? Number(r.amount || 0) : 0);
  }, 0);

  const criticalityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    ASSIGNED: 0,
    EN_ROUTE: 0,
    PICKED_UP: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  requests.forEach((r: any) => {
    if (r.priority && r.priority in criticalityCounts) {
      criticalityCounts[r.priority] = (criticalityCounts[r.priority] ?? 0) + 1;
    }
    if (r.status && r.status in statusCounts) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    }
  });

  const now = new Date();
  const monthlyTrend: { key: string; label: string; requests: number; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    monthlyTrend.push({ key, label, requests: 0, amount: 0 });
  }
  const map = new Map(monthlyTrend.map((m) => [m.key, m]));
  requests.forEach((r: any) => {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = map.get(key);
    if (bucket) {
      bucket.requests += 1;
      bucket.amount += Number(r.amount || 0);
    }
  });

  return {
    summary: {
      totalRequests,
      activeRequests,
      completedRequests,
      totalPaid,
      pendingAmount,
    },
    criticalityBreakdown: Object.entries(criticalityCounts).map(([name, value]) => ({ name, value })),
    statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    monthlyTrend,
  };
};
