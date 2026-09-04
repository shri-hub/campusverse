import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@campusverse.dev" },
    update: { passwordHash },
    create: {
      email: "admin@campusverse.dev",
      name: "System Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      profile: {
        create: { dept: "Administration" },
      },
    },
  });

  console.log("Seeded user:", user.email, "role:", user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
