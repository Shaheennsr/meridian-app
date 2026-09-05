import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { responses: { include: { question: true } } },
  });

  if (!attempt || attempt.userId !== session.user.id) redirect("/dashboard");
  if (!attempt.completedAt) redirect(`/blocks/${attemptId}`);

  const questionIds = attempt.questionIds as string[];
  const responsesByQuestion = new Map(attempt.responses.map((r) => [r.questionId, r]));
  const orderedResponses = questionIds
    .map((id) => responsesByQuestion.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const correctCount = orderedResponses.filter((r) => r.correct).length;
  const total = orderedResponses.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className="flex flex-1 flex-col bg-navy-50">
      <header className="flex h-[68px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-navy-700 px-8 text-white">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold">Meridian</span>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white">
          ← Dashboard
        </Link>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Block Score</div>
            <div className="mt-2 font-serif text-5xl font-semibold text-slate-900">{percent}%</div>
            <div className="mt-1.5 text-sm text-slate-500">
              {correctCount} of {total} correct
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {orderedResponses.map((response, i) => {
              const choices = response.question.choices as string[];
              return (
                <div key={response.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                      Question {i + 1} &middot; {response.question.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        response.correct ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {response.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="mt-3 font-serif text-[15px] leading-relaxed text-slate-900">
                    {response.question.stem}
                  </p>

                  <div className="mt-4 flex flex-col gap-1.5">
                    {choices.map((choice, ci) => {
                      const isCorrect = ci === response.question.correctIndex;
                      const isSelected = ci === response.selectedIndex;
                      return (
                        <div
                          key={ci}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isCorrect
                              ? "border-teal-300 bg-teal-50 text-teal-900"
                              : isSelected
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="font-semibold">{letters[ci]}. </span>
                          {choice}
                          {isCorrect && <span className="ml-2 text-xs font-medium">(correct answer)</span>}
                          {isSelected && !isCorrect && <span className="ml-2 text-xs font-medium">(your answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-4 rounded-lg bg-navy-50 p-3.5 text-sm leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-800">Tutor Mode Explanation: </span>
                    {response.question.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/blocks/new"
              className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-white"
            >
              Start Another Block
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" className="fill-teal-500" />
      <rect x="11" y="18" width="5" height="10" rx="1.5" fill="white" />
      <rect x="20" y="11" width="5" height="17" rx="1.5" fill="white" />
    </svg>
  );
}
