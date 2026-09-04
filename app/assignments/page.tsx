import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAssignment, deleteAssignment } from "@/lib/actions/assignments";

export const dynamic = "force-dynamic";

const CREATOR_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STAFF"];

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const myRole = (session?.user as any)?.role as string;
  const isCreator = CREATOR_ROLES.includes(myRole);

  const assignments = await prisma.assignment.findMany({
    orderBy: { dueDate: "asc" },
    include: { createdBy: { select: { name: true } } },
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
            Dashboard
          </Link>
        </div>

        {isCreator && (
          <form action={createAssignment} className="mt-6 space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Create assignment</h2>
            <input
              name="title"
              required
              placeholder="Title (e.g. Binary Trees lab)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <input
              name="subject"
              required
              placeholder="Subject (e.g. Data Structures)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Assignment description / instructions"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <div>
              <label className="text-sm text-slate-400">Due date</label>
              <input
                name="dueDate"
                type="date"
                required
                defaultValue={today}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
            >
              Create assignment
            </button>
          </form>
        )}

        <div className="mt-8 space-y-4">
          {assignments.length === 0 && (
            <p className="text-slate-500">No assignments yet.</p>
          )}

          {assignments.map((a) => (
            <article key={a.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{a.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {a.subject} | Due {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Posted by {a.createdBy.name}</p>
                </div>

                {isCreator && a.createdById === session.user.id && (
                  <form action={deleteAssignment.bind(null, a.id)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600 px-2 py-1 text-xs text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-slate-300">{a.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
