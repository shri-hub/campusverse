import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MARKER_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY", "STAFF"];

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const myRole = (session?.user as any)?.role as string;
  const myId = session.user.id as string;

  const isMarker = MARKER_ROLES.includes(myRole);

  if (isMarker) {
    const records = await prisma.attendanceRecord.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { student: { select: { name: true } } },
    });

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Attendance</h1>
            <div className="flex gap-3">
              <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
                Dashboard
              </Link>
              <Link
                href="/attendance/mark"
                className="rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-teal-400"
              >
                + Mark attendance
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{r.subject}</td>
                    <td className="px-4 py-3 text-slate-400">{r.student.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.status === "PRESENT"
                            ? "rounded-full bg-green-500/20 px-2 py-0.5 text-green-400"
                            : r.status === "ABSENT"
                            ? "rounded-full bg-red-500/20 px-2 py-0.5 text-red-400"
                            : "rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-400"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <p className="p-4 text-slate-500">No attendance records yet.</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Student view: their own attendance
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: myId },
    orderBy: { date: "desc" },
  });

  const present = records.filter((r) => r.status === "PRESENT").length;
  const total = records.length;
  const pct = total === 0 ? 0 : Math.round((present / total) * 100);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Attendance</h1>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
            Dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total sessions</p>
            <p className="mt-1 text-3xl font-bold">{total}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Present</p>
            <p className="mt-1 text-3xl font-bold text-green-400">{present}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Attendance %</p>
            <p className="mt-1 text-3xl font-bold text-teal-400">{pct}%</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === "PRESENT"
                          ? "rounded-full bg-green-500/20 px-2 py-0.5 text-green-400"
                          : r.status === "ABSENT"
                          ? "rounded-full bg-red-500/20 px-2 py-0.5 text-red-400"
                          : "rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p className="p-4 text-slate-500">
              No attendance records yet for you.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
