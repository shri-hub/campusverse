"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createNotice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in to post a notice.");
  }

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  await prisma.notice.create({
    data: {
      title,
      content,
      authorId: session.user.id as string,
    },
  });

  revalidatePath("/notices");
  redirect("/notices");
}

export async function deleteNotice(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) return;
  if (notice.authorId !== session.user.id) return;

  await prisma.notice.delete({ where: { id } });
  revalidatePath("/notices");
}
