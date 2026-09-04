"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MARKER_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STAFF"];

export async function markAttendance(formData: FormData) {
  const session = await auth();
  const role = (session?.user as any)?.role as string;
  if (!MARKER_ROLES.includes(role)) {
    throw new Error("You do not have permission to mark attendance.");
  }

  const subject = String(formData.get("subject") || "").trim();
  const dateStr = String(formData.get("date") || "");
  if (!subject || !dateStr) {
    throw new Error("Subject and date are required.");
  }

  const date = new Date(dateStr + "T00:00:00Z");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });

  // Build records: one per student from form fields named record_<studentId>
  const records = students
    .map((s) => {
      const status = String(
        formData.get("record_" + s.id) || "PRESENT"
      ) as "PRESENT" | "ABSENT" | "LEAVE";
      return {
        studentId: s.id,
        subject,
        date,
        status,
        markedById: session.user?.id as string | undefined,
      };
    })
    .filter((r) => (r.status === "PRESENT" || r.status === "ABSENT" || r.status === "LEAVE"));

  for (const record of records) {
    const where = {
      studentId_subject_date: {
        studentId: record.studentId,
        subject,
        date,
      },
    };
    const existing = await prisma.attendanceRecord.findUnique({ where });
    if (existing) {
      await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { status: record.status, markedById: record.markedById },
      });
    } else {
      await prisma.attendanceRecord.create({ data: record });
    }
  }

  revalidatePath("/attendance");
  redirect("/attendance");
}
