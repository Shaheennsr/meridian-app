"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const BLOCK_SIZE = 10;

export async function startBlock() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const inProgress = await prisma.attempt.findFirst({
    where: { userId, completedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (inProgress) redirect(`/blocks/${inProgress.id}`);

  const allQuestions = await prisma.question.findMany({ select: { id: true } });
  const shuffled = allQuestions.map((q) => q.id).sort(() => Math.random() - 0.5);
  const questionIds = shuffled.slice(0, BLOCK_SIZE);

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
    redirect(`/blocks/${attemptId}/results`);
  }

  redirect(`/blocks/${attemptId}`);
}
