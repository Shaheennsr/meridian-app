"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function latestResponseStatus(userId: string) {
  const responses = await prisma.response.findMany({
    where: { attempt: { userId } },
    select: { questionId: true, correct: true, answeredAt: true },
  });
  const latestByQuestion = new Map<string, { correct: boolean; answeredAt: Date }>();
  for (const r of responses) {
    const existing = latestByQuestion.get(r.questionId);
    if (!existing || r.answeredAt > existing.answeredAt) {
      latestByQuestion.set(r.questionId, { correct: r.correct, answeredAt: r.answeredAt });
    }
  }
  return latestByQuestion;
}

export async function startBlock(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const inProgress = await prisma.attempt.findFirst({
    where: { userId, completedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (inProgress) redirect(`/blocks/${inProgress.id}`);

  const categories = formData.getAll("categories").map(String);
  const count = Number(formData.get("count")) || 10;
  const status = String(formData.get("status") ?? "all");

  const pool = await prisma.question.findMany({
    where: categories.length > 0 ? { category: { in: categories } } : undefined,
    select: { id: true },
  });

  let candidateIds = pool.map((q) => q.id);

  if (status === "unused" || status === "incorrect") {
    const latestByQuestion = await latestResponseStatus(userId);
    if (status === "unused") {
      candidateIds = candidateIds.filter((id) => !latestByQuestion.has(id));
    } else {
      candidateIds = candidateIds.filter((id) => latestByQuestion.get(id)?.correct === false);
    }
  }

  if (candidateIds.length === 0) {
    redirect("/blocks/new?error=empty");
  }

  const shuffled = candidateIds.sort(() => Math.random() - 0.5);
  const questionIds = shuffled.slice(0, Math.min(count, shuffled.length));

  const attempt = await prisma.attempt.create({
    data: { userId, questionIds },
  });

  redirect(`/blocks/${attempt.id}`);
}

export async function submitAnswer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const attemptId = formData.get("attemptId") as string;
  const questionId = formData.get("questionId") as string;
  const questionIndex = formData.get("questionIndex") as string;
  const selectedIndex = Number(formData.get("selectedIndex"));

  if (!attemptId || !questionId || Number.isNaN(selectedIndex)) {
    redirect(`/blocks/${attemptId}?error=missing`);
  }

  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId || attempt.completedAt) {
    redirect("/dashboard");
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) redirect(`/blocks/${attemptId}`);

  const correct = selectedIndex === question.correctIndex;

  await prisma.response.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { selectedIndex, correct },
    create: { attemptId, questionId, selectedIndex, correct },
  });

  const questionIds = attempt.questionIds as string[];
  const answeredCount = await prisma.response.count({ where: { attemptId } });

  if (answeredCount >= questionIds.length) {
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { completedAt: new Date() },
    });
  }

  redirect(`/blocks/${attemptId}?q=${questionIndex}`);
}
