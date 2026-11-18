import { prisma } from "../lib/prisma";

export const subscribeNewsletter = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    return { subscriber: existing, alreadySubscribed: true };
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email: cleanEmail },
  });

  return { subscriber, alreadySubscribed: false };
};

export const getNewsletterSubscribers = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSubscriber.count(),
  ]);

  return { subscribers, total, page, limit };
};
