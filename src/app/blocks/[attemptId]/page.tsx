import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { submitAnswer } from "../actions";

export default async function BlockPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { responses: true },
  });

  if (!attempt || attempt.userId !== session.user.id) redirect("/dashboard");
  if (attempt.completedAt) redirect(`/blocks/${attemptId}/results`);

  const questionIds = attempt.questionIds as string[];
  const answeredIds = new Set(attempt.responses.map((r) => r.questionId));
  const currentIndex = questionIds.findIndex((id) => !answeredIds.has(id));

  if (currentIndex === -1) redirect(`/blocks/${attemptId}/results`);

  const question = await prisma.question.findUnique({ where: { id: questionIds[currentIndex] } });
  if (!question) redirect("/dashboard");

  const choices = question.choices as string[];
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
        <span className="text-sm font-medium text-slate-300">
          Question {currentIndex + 1} of {questionIds.length}
        </span>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${(currentIndex / questionIds.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {question.category}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm leading-relaxed text-slate-900">{question.stem}</p>

            <form action={submitAnswer} className="mt-6 flex flex-col gap-2">
              <input type="hidden" name="attemptId" value={attemptId} />
              <input type="hidden" name="questionId" value={question.id} />

              {choices.map((choice, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors hover:border-teal-500 hover:bg-teal-50 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50"
                >
                  <input
                    required
                    type="radio"
                    name="selectedIndex"
                    value={i}
                    className="mt-0.5 accent-teal-600"
                  />
                  <span>
                    <span className="font-semibold">{letters[i]}. </span>
                    {choice}
                  </span>
                </label>
              ))}

              <button
                type="submit"
                className="mt-4 self-end rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Submit Answer
              </button>
            </form>
          </div>

          <Link href="/dashboard" className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-700">
            ← Save and exit
          </Link>
        </div>
      </main>
    </div>
  );
}
