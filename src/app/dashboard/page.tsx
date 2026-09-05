import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, totalQuestions, responses, inProgress, completedAttempts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.question.count(),
    prisma.response.findMany({
      where: { attempt: { userId } },
      include: { question: { select: { category: true } } },
    }),
    prisma.attempt.findFirst({ where: { userId, completedAt: null } }),
    prisma.attempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      include: { responses: { orderBy: { answeredAt: "asc" } } },
    }),
  ]);

  if (!user) redirect("/login");

  const questionsDone = responses.length;
  const correctCount = responses.filter((r) => r.correct).length;
  const accuracy = questionsDone > 0 ? Math.round((correctCount / questionsDone) * 100) : null;

  const categoryMap = new Map<string, { attempted: number; correct: number }>();
  for (const r of responses) {
    const cat = r.question.category;
    const entry = categoryMap.get(cat) ?? { attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (r.correct) entry.correct += 1;
    categoryMap.set(cat, entry);
  }
  const categoryStats = [...categoryMap.entries()]
    .map(([category, { attempted, correct }]) => ({
      category,
      attempted,
      pct: Math.round((correct / attempted) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const perItemTimes: number[] = [];
  for (const a of completedAttempts) {
    if (a.responses.length === 0) continue;
    const last = a.responses[a.responses.length - 1].answeredAt;
    const seconds = (last.getTime() - a.startedAt.getTime()) / 1000;
    if (seconds > 0) perItemTimes.push(seconds / a.responses.length);
  }
  const avgTime = perItemTimes.length > 0
    ? Math.round(perItemTimes.reduce((a, b) => a + b, 0) / perItemTimes.length)
    : null;

  const recentAttempts = completedAttempts.slice(0, 5);

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/dashboard" user={user} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex h-[68px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-9">
          <div>
            <div className="text-[17px] font-semibold text-slate-900">
              Welcome back, {user.name.split(" ")[0]}
            </div>
            <div className="text-[12.5px] text-slate-500">
              {user.examDate ? `Exam date: ${user.examDate}` : "Signed in as " + user.email}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {inProgress ? (
              <Link
                href={`/blocks/${inProgress.id}`}
                className="rounded-md bg-navy-700 px-4.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-600"
              >
                Resume Block
              </Link>
            ) : (
              <Link
                href="/blocks/new"
                className="rounded-md bg-navy-700 px-4.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-600"
              >
                Start New Block
              </Link>
            )}
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-500 text-xs font-semibold text-white">
              {initials(user.name)}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto px-9 py-7">
          {/* Stat row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5">
              <ProgressRing percent={accuracy ?? 0} />
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Readiness Score
                </div>
                <div className="text-[28px] font-bold text-slate-900">
                  {accuracy !== null ? `${accuracy}%` : "—"}
                </div>
                <div className="text-xs text-slate-500">based on overall accuracy</div>
              </div>
            </div>

            <StatCard
              label="Questions Done"
              value={questionsDone.toString()}
              sub={`of ${totalQuestions} total`}
            />
            <StatCard
              label="Overall Accuracy"
              value={accuracy !== null ? `${accuracy}%` : "—"}
              sub={accuracy !== null ? `${correctCount} of ${questionsDone} correct` : "complete a block to see this"}
            />
            <StatCard
              label="Avg Time / Item"
              value={avgTime !== null ? `${avgTime}s` : "—"}
              sub="across completed blocks"
            />
          </div>

          {/* Middle row */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            {/* Performance by category */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4.5 text-sm font-semibold text-slate-900">Performance by Specialty</div>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-slate-500">Complete a block to see your performance breakdown here.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {categoryStats.map((c) => (
                    <div key={c.category}>
                      <div className="mb-1.5 flex justify-between text-[13px]">
                        <span className="text-slate-700">{c.category}</span>
                        <span className="font-semibold text-slate-900">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${c.pct >= 70 ? "bg-teal-500" : c.pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation + activity */}
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-navy-700 p-5.5 text-white">
                <div className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-white/60">
                  Recommended Next
                </div>
                {categoryStats.length > 0 ? (
                  <>
                    <div className="mb-2 text-[15px] font-semibold">
                      {categoryStats[categoryStats.length - 1].category} &middot; Weak Area Block
                    </div>
                    <div className="mb-4.5 text-[12.5px] text-white/60">
                      Your lowest-scoring specialty so far
                    </div>
                  </>
                ) : (
                  <div className="mb-4.5 text-[13px] text-white/70">
                    Start your first block to get a personalized recommendation.
                  </div>
                )}
                <Link
                  href="/blocks/new"
                  className="inline-flex rounded-md bg-teal-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600"
                >
                  Start Block
                </Link>
              </div>

              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5.5">
                <div className="mb-4 text-sm font-semibold text-slate-900">Recent Activity</div>
                {recentAttempts.length === 0 ? (
                  <p className="text-sm text-slate-500">No completed blocks yet.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {recentAttempts.map((a) => {
                      const correct = a.responses.filter((r) => r.correct).length;
                      const pct = a.responses.length > 0 ? Math.round((correct / a.responses.length) * 100) : 0;
                      return (
                        <Link
                          key={a.id}
                          href={`/blocks/${a.id}/results`}
                          className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 text-sm transition-colors hover:bg-slate-50"
                        >
                          <span className="text-slate-500">
                            {a.completedAt
                              ? new Date(a.completedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                          <span
                            className={`font-semibold ${pct >= 70 ? "text-teal-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}
                          >
                            {pct}% &middot; {correct}/{a.responses.length}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mb-1.5 text-[26px] font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 37;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#eef0f4" strokeWidth="9" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-teal-500"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
      />
    </svg>
  );
}
