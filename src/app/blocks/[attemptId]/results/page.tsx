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
        <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white">
          Dashboard
        </Link>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Block Score</div>
            <div className="mt-2 text-4xl font-bold text-slate-900">{percent}%</div>
            <div className="mt-1 text-sm text-slate-500">
              {correctCount} of {total} correct
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {orderedResponses.map((response, i) => {
              const choices = response.question.choices as string[];
              return (
                <div key={response.id} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Question {i + 1} · {response.question.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        response.correct ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {response.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-900">{response.question.stem}</p>

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
                              ? "border-red-300 bg-red-50 text-red-900"
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

                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Explanation: </span>
                    {response.question.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
