"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SCHEDULER_ROLES = ["SUPER_ADMIN", "ADMIN"];

export async function createTimeSlot(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!SCHEDULER_ROLES.includes(role)) {
    throw new Error("Only admins can manage the timetable.");
  }

  const day = String(formData.get("day") || "");
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const room = String(formData.get("room") || "").trim() || null;
  const facultyId = String(formData.get("facultyId") || "") || null;

  const validDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  if (!validDays.includes(day) || !startTime || !endTime || !subject) {
    throw new Error("Day, start, end and subject are required.");
  }

  await prisma.timeSlot.create({
    data: { day: day as any, startTime, endTime, subject, room, facultyId },
  });

  revalidatePath("/timetable");
  redirect("/timetable");
}

export async function deleteTimeSlot(id: string) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!SCHEDULER_ROLES.includes(role)) return;

  await prisma.timeSlot.delete({ where: { id } });
  revalidatePath("/timetable");
}
