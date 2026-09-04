"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

export async function createUser(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error("Only admins can create users.");
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const newRole = String(formData.get("role") || "STUDENT");

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }

  const validRoles = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STUDENT", "STAFF"];
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role.");
  }

  const passwordHash = await hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A user with that email already exists.");
  }

  await prisma.user.create({
    data: { name, email, passwordHash, role: newRole as any },
  });

  revalidatePath("/users");
}

export async function toggleUserActive(id: string) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!ADMIN_ROLES.includes(role)) return;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || role === "ADMIN" && user.role === "SUPER_ADMIN") return;

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/users");
}
