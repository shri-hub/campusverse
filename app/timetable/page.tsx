import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTimeSlot, deleteTimeSlot } from "@/lib/actions/timetable";

export const dynamic = "force-dynamic";

const SCHEDULER_ROLES = ["SUPER_ADMIN", "ADMIN"];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default async function TimetablePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const myRole = (session?.user as any)?.role as string;
  const isScheduler = SCHEDULER_ROLES.includes(myRole);

  const slots = await prisma.timeSlot.findMany({
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
    include: { faculty: { select: { name: true } } },
  });

  const faculty = await prisma.user.findMany({
    where: { role: { in: ["FACULTY", "ADMIN", "SUPER_ADMIN"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Order display by day
  const dayOrder: Record<string, number> = {
    MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };
  const sortedSlots = [...slots].sort(
    (a, b) => (dayOrder[a.day] - dayOrder[b.day]) || (a.startTime.localeCompare(b.startTime))
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Timetable</h1>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
            Dashboard
          </Link>
        </div>

        {isScheduler && (
          <form action={createTimeSlot} className="mt-6 space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Add a time slot</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                name="day"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <input
                name="subject"
                required
                placeholder="Subject"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
              />
              <input
                name="room"
                placeholder="Room (optional)"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400">Start</label>
                <input
                  name="startTime"
                  type="time"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">End</label>
                <input
                  name="endTime"
                  type="time"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-teal-400 focus:outline-none"
                />
              </div>
              <select
                name="facultyId"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
              >
                <option value="">No faculty assigned</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
            >
              Add slot
            </button>
          </form>
        )}

        <div className="mt-8 space-y-6">
          {DAYS.map((day) => {
            const daySlots = sortedSlots.filter((s) => s.day === day);
            if (daySlots.length === 0) return null;
            return (
              <div key={day}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-400">
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </h2>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {daySlots.map((s) => (
                    <div key={s.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{s.subject}</p>
                          <p className="text-sm text-slate-400">
                            {s.startTime} - {s.endTime}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {s.room || "No room"} {s.faculty ? "| " + s.faculty.name : ""}
                          </p>
                        </div>
                        {isScheduler && (
                          <form action={deleteTimeSlot.bind(null, s.id)}>
                            <button
                              type="submit"
                              className="rounded border border-red-600 px-1.5 py-0.5 text-xs text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              X
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {sortedSlots.length === 0 && (
            <p className="text-slate-500">No timetable slots yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
