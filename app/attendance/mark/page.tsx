import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markAttendance } from "@/lib/actions/attendance";

export const dynamic = "force-dynamic";

const MARKER_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STAFF"];

const statusStyle: Record<string, string> = {
  PRESENT: "bg-green-500/20 text-green-400 border-green-700",
  ABSENT: "bg-red-500/20 text-red-400 border-red-700",
  LEAVE: "bg-yellow-500/20 text-yellow-400 border-yellow-700",
};

export default async function MarkAttendancePage() {
  const session = await auth();
  const myRole = (session?.user as any)?.role as string;

  if (!session?.user) redirect("/login");
  if (!MARKER_ROLES.includes(myRole)) redirect("/dashboard");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <Link href="/attendance" className="text-sm text-teal-400 hover:underline">
            Back to attendance
          </Link>
        </div>

        <form action={markAttendance} className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="subject"
              required
              placeholder="Subject (e.g. Data Structures)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
            />
          </div>

          {students.length === 0 ? (
            <p className="mt-4 text-slate-500">
              No students exist yet. Create students from the Users page first.
            </p>
          ) : (
            <div className="mt-5 space-y-2">
              {students.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-4 py-2"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <select
                    name={"record_" + s.id}
                    defaultValue="PRESENT"
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LEAVE">Leave</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {students.length > 0 && (
            <button
              type="submit"
              className="mt-5 rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
            >
              Save attendance ({students.length} students)
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
