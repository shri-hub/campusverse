import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "FACULTY" | "STUDENT" | "STAFF";

interface NavItem {
  label: string;
  href: string;
}

const adminNav: NavItem[] = [
  { label: "Users", href: "/users" },
  { label: "Notices", href: "/notices" },
  { label: "Assignments", href: "/assignments" },
  { label: "Attendance", href: "/attendance" },
];

const facultyNav: NavItem[] = [
  { label: "Notices", href: "/notices" },
  { label: "Assignments", href: "/assignments" },
  { label: "Attendance", href: "/attendance" },
];

const staffNav: NavItem[] = [
  { label: "Notices", href: "/notices" },
  { label: "Attendance", href: "/attendance" },
];

const studentNav: NavItem[] = [
  { label: "Notices", href: "/notices" },
  { label: "Assignments", href: "/assignments" },
  { label: "Attendance", href: "/attendance" },
];

function getNav(role: Role): NavItem[] {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return adminNav;
    case "FACULTY":
      return facultyNav;
    case "STAFF":
      return staffNav;
    case "STUDENT":
      return studentNav;
    default:
      return [];
  }
}

function roleTitle(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "Administrator";
    case "FACULTY":
      return "Faculty";
    case "STUDENT":
      return "Student";
    case "STAFF":
      return "Staff";
    default:
      return "Member";
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role as Role;
  const name = session.user.name as string;
  const nav = getNav(role);
  const title = roleTitle(role);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-teal-400">CampusVerse</span>
        <span className="text-sm text-slate-400">{title} workspace</span>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-slate-400">
            You are signed in as {title} ({role}).
          </p>

          <nav className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm font-medium hover:border-teal-400 hover:bg-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {nav.length === 0 && (
            <p className="mt-6 text-slate-500">
              No modules available for this role yet.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-red-600 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
