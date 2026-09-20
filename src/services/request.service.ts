import { prisma } from "../lib/prisma";
import { RequestStatus, AmbulanceStatus, DispatchStatus } from "../../generated/prisma/client";

export const createEmergencyRequest = async (patientId: number, data: any) => {
  return await prisma.emergencyRequest.create({
    data: {
      patientId,
      ...data
    }
  });
};

export const getRequests = async (page: number, limit: number, status?: string) => {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as any, deletedAt: null } : { deletedAt: null };

  const [requests, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip,
      take: limit,
      include: { patient: { select: { email: true, profile: true } } }
    }),
    prisma.emergencyRequest.count({ where })
  ]);

  return { requests, total, page, limit };
};

export const getRequestById = async (id: number) => {
  const request = await prisma.emergencyRequest.findFirst({
    where: { id, deletedAt: null },
    include: {
      patient: { select: { email: true, profile: true } },
      dispatches: { include: { ambulance: true, driver: { select: { email: true, profile: true } } } }
    }
  });
  if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  return request;
};

// TRANSACTION LOGIC
export const assignAmbulance = async (requestId: number, ambulanceId: number, adminId: number) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findFirst({ where: { id: requestId, deletedAt: null } });
    if (!request || request.status !== RequestStatus.PENDING) {
      throw Object.assign(new Error("Request is either not found or already processed"), { statusCode: 400 });
    }

    const ambulance = await tx.ambulance.findFirst({ where: { id: ambulanceId, status: AmbulanceStatus.AVAILABLE } });
    if (!ambulance || !ambulance.driverId) {
      throw Object.assign(new Error("Ambulance is not available or has no driver"), { statusCode: 400 });
    }

    // Assign and update status
    const updatedRequest = await tx.emergencyRequest.update({
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
        details: JSON.stringify({ ambulanceId, driverId: ambulance.driverId })
      }
    });

    return { request: updatedRequest, dispatch };
  });
};

export const updateStatus = async (id: number, status: RequestStatus, driverId: number) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.emergencyRequest.findFirst({
      where: { id, deletedAt: null },
      include: { dispatches: { where: { driverId }, take: 1, orderBy: { createdAt: 'desc' } } }
    });

    if (!request) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
    if (request.dispatches.length === 0) throw Object.assign(new Error("You are not assigned to this request"), { statusCode: 403 });

    const updated = await tx.emergencyRequest.update({
      where: { id },
      data: { status }
    });

    // Optional: Log status transitions
    await tx.auditLog.create({
      data: {
        userId: driverId,
        action: "STATUS_UPDATE",
        entity: "EmergencyRequest",
        entityId: id,
        details: JSON.stringify({ status })
      }
    });

    return updated;
  });
};

export const cancelRequest = async (id: number) => {
  // Soft delete
  return await prisma.emergencyRequest.update({
    where: { id },
    data: { deletedAt: new Date(), status: RequestStatus.CANCELLED }
  });
};
