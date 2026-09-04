import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between bg-slate-900 px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-white font-bold text-sm">
            M
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">Meridian</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 leading-tight">Board Review</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.examDate ? `Exam date: ${user.examDate}` : "You're signed in with a real account — this is stored in the database."}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Questions Done</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
            <div className="mt-1 text-xs text-slate-500">of 12,400 total</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall Accuracy</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">—</div>
            <div className="mt-1 text-xs text-slate-500">complete a block to see this</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Account Created</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
            <div className="mt-1 text-xs text-slate-500">{user.email}</div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">You're set up</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg">
            Registration, login, and sessions are real and backed by a database — this account will persist across visits.
            The full question bank, block builder, and results experience is available as the interactive product demo.
          </p>
        </div>
      </main>
    </div>
  );
}
