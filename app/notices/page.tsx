import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotice, deleteNotice } from "@/lib/actions/notices";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const session = await auth();
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notices</h1>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {session?.user ? (
          <form action={createNotice} className="mt-6 space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <input
              name="title"
              required
              placeholder="Notice title"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <textarea
              name="content"
              required
              rows={3}
              placeholder="Notice content..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
            >
              Post Notice
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
            You must be{" "}
            <Link href="/login" className="text-teal-400 hover:underline">
              signed in
            </Link>{" "}
            to post a notice.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {notices.length === 0 && (
            <p className="text-slate-500">No notices yet.</p>
          )}

          {notices.map((notice) => (
            <article key={notice.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{notice.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {notice.author.name} | {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {session?.user?.id === notice.authorId && (
                  <form action={deleteNotice.bind(null, notice.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600 px-2 py-1 text-xs text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-slate-300">{notice.content}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
