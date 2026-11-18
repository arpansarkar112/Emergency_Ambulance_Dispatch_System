import { prisma } from "../lib/prisma";

export const createContactMessage = async (data: any) => {
  return await prisma.contactMessage.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      subject: data.subject.trim(),
      category: data.category?.trim() || "General Inquiry",
      message: data.message.trim(),
    },
  });
};

export const getContactMessages = async (page = 1, limit = 20, status?: string) => {
  const skip = (page - 1) * limit;
  const where = status && status !== "ALL" ? { status: status as any } : {};

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const updateContactMessageStatus = async (id: string, status: "NEW" | "READ" | "REPLIED") => {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Contact message not found"), { statusCode: 404 });

  return await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
};

export const deleteContactMessage = async (id: string) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Contact message not found"), { statusCode: 404 });

  return await prisma.contactMessage.delete({ where: { id } });
};
