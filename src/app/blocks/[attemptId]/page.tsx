import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { submitAnswer } from "../actions";

export default async function BlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { attemptId } = await params;
  const { q } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { responses: true },
  });

  if (!attempt || attempt.userId !== session.user.id) redirect("/dashboard");

  const questionIds = attempt.questionIds as string[];
  const responseByQuestion = new Map(attempt.responses.map((r) => [r.questionId, r]));

  const requestedIndex = q !== undefined ? Number(q) : null;
  let currentIndex: number;
  if (requestedIndex !== null && requestedIndex >= 0 && requestedIndex < questionIds.length) {
    currentIndex = requestedIndex;
  } else if (attempt.completedAt) {
    redirect(`/blocks/${attemptId}/results`);
  } else {
    const firstUnanswered = questionIds.findIndex((id) => !responseByQuestion.has(id));
    currentIndex = firstUnanswered === -1 ? questionIds.length - 1 : firstUnanswered;
  }

  const question = await prisma.question.findUnique({ where: { id: questionIds[currentIndex] } });
  if (!question) redirect("/dashboard");

  const choices = question.choices as string[];
  const letters = ["A", "B", "C", "D", "E"];
  const response = responseByQuestion.get(question.id);
  const isRevealed = Boolean(response);
  const isLast = currentIndex === questionIds.length - 1;

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-navy-50">
      <header className="flex h-[68px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-navy-700 px-6 text-white">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden text-sm font-semibold sm:inline">Meridian</span>
          <span className="h-5 w-px bg-white/20" />
          <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white">
            ← Dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[13px] font-medium">
            Question {currentIndex + 1} of {questionIds.length}
          </span>
          <div className="h-1.5 w-[200px] overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${((currentIndex + (isRevealed ? 1 : 0)) / questionIds.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">Tutor Mode</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigator */}
        <aside className="hidden w-[240px] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 md:block">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Question Navigator
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questionIds.map((id, i) => {
              const r = responseByQuestion.get(id);
              const answered = Boolean(r);
              const isCurrent = i === currentIndex;
              return (
                <Link
                  key={id}
                  href={`/blocks/${attemptId}?q=${i}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "ring-2 ring-teal-500 ring-offset-1"
                      : ""
                  } ${
                    answered
                      ? r?.correct
                        ? "bg-teal-500 text-white"
                        : "bg-rose-500 text-white"
                      : "border border-slate-300 bg-white text-slate-600 hover:border-teal-400"
                  }`}
                >
                  {i + 1}
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 text-[11.5px] text-slate-500">
            <LegendDot className="bg-teal-500" label="Correct" />
            <LegendDot className="bg-rose-500" label="Incorrect" />
            <LegendDot className="border border-slate-300 bg-white" label="Unanswered" />
          </div>
        </aside>

        {/* Main column */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-teal-600">{question.category}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                Item {currentIndex + 1}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="font-serif text-[15.5px] leading-relaxed text-slate-900">{question.stem}</p>

              <form key={question.id} action={submitAnswer} className="mt-6 flex flex-col gap-2.5">
                <input type="hidden" name="attemptId" value={attemptId} />
                <input type="hidden" name="questionId" value={question.id} />
                <input type="hidden" name="questionIndex" value={currentIndex} />

                {choices.map((choice, i) => {
                  const isCorrectChoice = i === question.correctIndex;
                  const isSelected = response?.selectedIndex === i;

                  let rowClass =
                    "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm text-slate-800 transition-colors";
                  if (isRevealed) {
                    if (isCorrectChoice) {
                      rowClass += " border-teal-400 bg-teal-50";
                    } else if (isSelected) {
                      rowClass += " border-rose-300 bg-rose-50";
                    } else {
                      rowClass += " border-slate-200 opacity-70";
                    }
                  } else {
                    rowClass +=
                      " cursor-pointer border-slate-200 hover:border-teal-500 hover:bg-teal-50 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50";
                  }

                  return (
                    <label key={i} className={rowClass}>
                      <input
                        required
                        disabled={isRevealed}
                        type="radio"
                        name="selectedIndex"
                        value={i}
                        defaultChecked={isSelected}
                        className="mt-0.5 accent-teal-600"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">{letters[i]}. </span>
                        {choice}
                      </span>
                      {isRevealed && isCorrectChoice && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0 text-teal-600">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {isRevealed && isSelected && !isCorrectChoice && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0 text-rose-600">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </label>
                  );
                })}

                {!isRevealed && (
                  <button
                    type="submit"
                    className="mt-3 self-end rounded-md bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                  >
                    Submit Answer
                  </button>
                )}
              </form>
            </div>

            {isRevealed && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-2.5 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      response?.correct ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {response?.correct ? "Correct" : "Incorrect"}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">Tutor Mode Explanation</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{question.explanation}</p>

                <div className="mt-5 flex justify-end gap-3">
                  {!isLast && (
                    <Link
                      href={`/blocks/${attemptId}?q=${currentIndex + 1}`}
                      className="rounded-md bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                    >
                      Next Question
                    </Link>
                  )}
                  {isLast && attempt.completedAt && (
                    <Link
                      href={`/blocks/${attemptId}/results`}
                      className="rounded-md bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                    >
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            )}

            <Link href="/dashboard" className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-700">
              Save and exit
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 flex-shrink-0 rounded ${className}`} />
      {label}
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
