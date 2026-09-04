import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <h1 className="text-xl text-white">You are not signed in.</h1>
          <a href="/login" className="mt-4 inline-block rounded-lg bg-teal-500 px-4 py-2 font-semibold text-slate-950">
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold">Welcome to CampusVerse</h1>
          <p className="mt-1 text-slate-400">You are signed in.</p>

          <dl className="mt-6 grid grid-cols-1 gap-3 text-sm">
            <div className="rounded-lg bg-slate-800 p-4">
              <dt className="text-slate-400">Name</dt>
              <dd className="text-lg font-semibold">{session.user.name}</dd>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <dt className="text-slate-400">Email</dt>
              <dd className="text-lg font-semibold">{session.user.email}</dd>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <dt className="text-slate-400">Role</dt>
              <dd className="text-lg font-semibold text-teal-400">
                {(session.user as any).role}
              </dd>
            </div>
          </dl>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
