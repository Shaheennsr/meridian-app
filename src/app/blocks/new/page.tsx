import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { startBlock, latestResponseStatus } from "../actions";

export default async function CreateBlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const inProgress = await prisma.attempt.findFirst({
    where: { userId, completedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (inProgress) redirect(`/blocks/${inProgress.id}`);

  const [totalQuestions, categoryCounts, latestByQuestion] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ["category"], _count: true, orderBy: { category: "asc" } }),
    latestResponseStatus(userId),
  ]);

  const unusedCount = totalQuestions - latestByQuestion.size;
  const incorrectCount = [...latestByQuestion.values()].filter((v) => !v.correct).length;

  const countOptions = [10, 25, 40, totalQuestions].filter((n, i, arr) => n > 0 && arr.indexOf(n) === i);

  return (
    <div className="flex flex-1 flex-col bg-navy-50">
      <header className="flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-8">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold text-slate-900">Create a New Block</span>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Dashboard
        </Link>
      </header>

      <main className="flex-1 px-8 py-9">
        <form action={startBlock} className="mx-auto grid max-w-5xl grid-cols-1 gap-7 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {error === "empty" && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                No questions match that combination of filters — try widening your selection.
              </p>
            )}

            {/* Status filter */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 text-sm font-semibold text-slate-900">Question Status</div>
              <div className="grid grid-cols-3 gap-3">
                <StatusOption value="all" label="All" count={totalQuestions} defaultChecked />
                <StatusOption value="unused" label="Unused" count={unusedCount} />
                <StatusOption value="incorrect" label="Previously Incorrect" count={incorrectCount} />
              </div>
            </section>

            {/* Question count */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 text-sm font-semibold text-slate-900">Question Count</div>
              <div className="flex flex-wrap gap-3">
                {countOptions.map((n) => (
                  <label
                    key={n}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800"
                  >
                    <input
                      type="radio"
                      name="count"
                      value={n}
                      defaultChecked={n === Math.min(10, totalQuestions)}
                      className="accent-teal-600"
                    />
                    {n === totalQuestions ? `All (${n})` : n}
                  </label>
                ))}
              </div>
            </section>

            {/* Topics */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 text-sm font-semibold text-slate-900">Topics</div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {categoryCounts.map((c) => (
                  <label
                    key={c.category}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        name="categories"
                        value={c.category}
                        defaultChecked
                        className="accent-teal-600"
                      />
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400">{c._count}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
            <div className="mb-4 text-sm font-semibold text-slate-900">Block Summary</div>
            <div className="flex flex-col gap-3 text-[13px]">
              <SummaryRow label="Mode" value="Tutor Mode" />
              <SummaryRow label="Status" value="Set above" />
              <SummaryRow label="Topics" value={`${categoryCounts.length} selected by default`} />
            </div>
            <div className="mt-4 rounded-lg bg-teal-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-teal-800">
              In Tutor Mode, the correct answer and full explanation reveal immediately after you submit each
              question.
            </div>
            <button
              type="submit"
              className="mt-5 w-full rounded-md bg-navy-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
            >
              Start Block
            </button>
          </aside>
        </form>
      </main>
    </div>
  );
}

function StatusOption({
  value,
  label,
  count,
  defaultChecked,
}: {
  value: string;
  label: string;
  count: number;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-slate-200 px-3 py-3.5 text-center has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
      <input type="radio" name="status" value={value} defaultChecked={defaultChecked} className="sr-only" />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="text-xs text-slate-400">{count}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" className="fill-teal-500" />
      <rect x="11" y="18" width="5" height="10" rx="1.5" fill="white" />
      <rect x="20" y="11" width="5" height="17" rx="1.5" fill="white" />
    </svg>
  );
}
