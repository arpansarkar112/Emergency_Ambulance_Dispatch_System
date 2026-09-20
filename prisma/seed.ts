import { PrismaClient, Role } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@ambulance.com" },
    update: {},
    create: {
      email: "admin@ambulance.com",
      password: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: "Super",
          lastName: "Admin"
        }
      }
    }
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
