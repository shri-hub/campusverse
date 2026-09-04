import Link from "next/link";

const features = [
  "Role-based login (Admin / Faculty / Student)",
  "Timetable & Attendance tracking",
  "Assignments & Project management",
  "Results, Notices & Messaging",
  "Library & Lab management",
  "Analytics dashboard",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-teal-400">CampusVerse</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          A Complete Campus Management Platform
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          CampusVerse unifies timetables, attendance, assignments, projects,
          results and more into one platform for students, faculty and admins.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 hover:bg-teal-400"
          >
            Get Started
          </Link>
          <a
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-800"
          >
            View Dashboard
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <p className="text-slate-200">{f}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 pb-8 pt-4 text-center text-sm text-slate-500">
        CampusVerse - Final Year CSE Major Project
      </footer>
    </main>
  );
}
