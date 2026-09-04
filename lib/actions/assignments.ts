"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CREATOR_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STAFF"];

export async function createAssignment(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!CREATOR_ROLES.includes(role)) {
    throw new Error("You do not have permission to create assignments.");
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const dueDateStr = String(formData.get("dueDate") || "");

  if (!title || !description || !subject || !dueDateStr) {
    throw new Error("All fields are required.");
  }

  const dueDate = new Date(dueDateStr + "T23:59:00");

  await prisma.assignment.create({
    data: {
      title,
      description,
      subject,
      dueDate,
      createdById: session.user.id as string,
    },
  });

  revalidatePath("/assignments");
  redirect("/assignments");
}

export async function deleteAssignment(id: string) {
  const session = await auth();
  if (!session?.user) return;

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) return;
  if (assignment.createdById !== session.user.id) return;

  await prisma.assignment.delete({ where: { id } });
  revalidatePath("/assignments");
}
