import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  // NOTE: plain hash for a quick seed test. We'll replace with proper
  // password hashing (bcrypt) when we build real Auth later.
  const passwordHash = createHash("sha256").update("admin123").digest("hex");

  const user = await prisma.user.upsert({
    where: { email: "admin@campusverse.dev" },
    update: {},
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

  console.log("Created user:", user.email, "role:", user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
