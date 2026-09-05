import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { startBlock } from "@/app/blocks/actions";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const [totalQuestions, responses, inProgress, recentAttempts] = await Promise.all([
    prisma.question.count(),
    prisma.response.findMany({ where: { attempt: { userId: user.id } } }),
    prisma.attempt.findFirst({ where: { userId: user.id, completedAt: null } }),
    prisma.attempt.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { responses: true },
    }),
  ]);

  const questionsDone = responses.length;
  const correctCount = responses.filter((r) => r.correct).length;
  const accuracy = questionsDone > 0 ? Math.round((correctCount / questionsDone) * 100) : null;

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
            <div className="mt-2 text-3xl font-bold text-slate-900">{questionsDone}</div>
            <div className="mt-1 text-xs text-slate-500">of {totalQuestions} total</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall Accuracy</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{accuracy !== null ? `${accuracy}%` : "—"}</div>
            <div className="mt-1 text-xs text-slate-500">
              {accuracy !== null ? `${correctCount} of ${questionsDone} correct` : "complete a block to see this"}
            </div>
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {inProgress ? "Block in progress" : "Ready for another block?"}
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-lg">
                {inProgress
                  ? "Pick up where you left off."
                  : `Answer a randomized 10-question block pulled from ${totalQuestions} board-style questions.`}
              </p>
            </div>
            {inProgress ? (
              <Link
                href={`/blocks/${inProgress.id}`}
                className="rounded-lg bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Resume Block
              </Link>
            ) : (
              <form action={startBlock}>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Start New Block
                </button>
              </form>
            )}
          </div>
        </div>

        {recentAttempts.length > 0 && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Recent Blocks</h2>
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {recentAttempts.map((a) => {
                const correct = a.responses.filter((r) => r.correct).length;
                const pct = a.responses.length > 0 ? Math.round((correct / a.responses.length) * 100) : 0;
                return (
                  <Link
                    key={a.id}
                    href={`/blocks/${a.id}/results`}
                    className="flex items-center justify-between py-3 text-sm hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span className="text-slate-600">
                      {a.completedAt
                        ? new Date(a.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {pct}% · {correct}/{a.responses.length}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
