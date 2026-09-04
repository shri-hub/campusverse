import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUser, toggleUserActive } from "@/lib/actions/users";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

export default async function UsersPage() {
  const session = await auth();
  const myRole = (session?.user as any)?.role as string;

  if (!session?.user) redirect("/login");
  if (!ADMIN_ROLES.includes(myRole)) redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { profile: true },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link href="/dashboard" className="text-sm text-teal-400 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* Create user form */}
        <form action={createUser} className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Create a new account</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Full name"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Temporary password"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            />
            <select
              name="role"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 focus:border-teal-400 focus:outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950 hover:bg-teal-400"
          >
            Create user
          </button>
        </form>

        {/* User list */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-teal-400">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.isActive
                          ? "rounded-full bg-green-500/20 px-2 py-0.5 text-green-400"
                          : "rounded-full bg-red-500/20 px-2 py-0.5 text-red-400"
                      }
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleUserActive.bind(null, u.id)}>
                      <button
                        type="submit"
                        className="text-xs text-slate-400 hover:text-teal-400"
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
