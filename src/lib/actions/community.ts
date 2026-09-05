"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function friendshipPair(userAId: string, userBId: string) {
  return userAId < userBId ? { userAId, userBId } : { userAId: userBId, userBId: userAId };
}

async function areFriends(userId: string, otherId: string) {
  const pair = friendshipPair(userId, otherId);
  const friendship = await prisma.friendship.findUnique({
    where: { userAId_userBId: pair },
  });
  return !!friendship;
}

export async function searchUsers(query: string) {
  const userId = await requireUserId();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: { id: true, name: true, email: true },
  });

  const [friendships, outgoing, incoming] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
    }),
    prisma.friendRequest.findMany({ where: { senderId: userId, status: "pending" } }),
    prisma.friendRequest.findMany({ where: { receiverId: userId, status: "pending" } }),
  ]);

  const friendIds = new Set(
    friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId))
  );
  const outgoingIds = new Set(outgoing.map((r) => r.receiverId));
  const incomingIds = new Set(incoming.map((r) => r.senderId));

  return users.map((u) => ({
    ...u,
    status: friendIds.has(u.id)
      ? ("friends" as const)
      : outgoingIds.has(u.id)
        ? ("requested" as const)
        : incomingIds.has(u.id)
          ? ("incoming" as const)
          : ("none" as const),
  }));
}

export async function sendFriendRequest(receiverId: string) {
  const userId = await requireUserId();
  if (receiverId === userId) throw new Error("Cannot friend yourself");

  if (await areFriends(userId, receiverId)) return;

  const existingReverse = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: userId } },
  });
  if (existingReverse && existingReverse.status === "pending") {
    await acceptRequestInternal(existingReverse.id, userId);
    return;
  }

  await prisma.friendRequest.upsert({
    where: { senderId_receiverId: { senderId: userId, receiverId } },
    update: { status: "pending" },
    create: { senderId: userId, receiverId, status: "pending" },
  });
}

async function acceptRequestInternal(requestId: string, actingUserId: string) {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.receiverId !== actingUserId) throw new Error("Not authorized");

  const pair = friendshipPair(request.senderId, request.receiverId);
  await prisma.$transaction([
    prisma.friendRequest.update({ where: { id: requestId }, data: { status: "accepted" } }),
    prisma.friendship.upsert({
      where: { userAId_userBId: pair },
      update: {},
      create: pair,
    }),
  ]);
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  const userId = await requireUserId();
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.receiverId !== userId) throw new Error("Not authorized");

  if (accept) {
    await acceptRequestInternal(requestId, userId);
  } else {
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "declined" } });
  }
}

export async function getCommunityData() {
  const userId = await requireUserId();

  const [friendships, incomingRequests] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: { userA: { select: { id: true, name: true, email: true } }, userB: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "pending" },
      include: { sender: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = friendships.map((f) => (f.userAId === userId ? f.userB : f.userA));

  return {
    friends,
    incomingRequests: incomingRequests.map((r) => ({ id: r.id, sender: r.sender })),
  };
}

export async function getMessages(friendId: string) {
  const userId = await requireUserId();
  if (!(await areFriends(userId, friendId))) throw new Error("Not friends");

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    fromMe: m.senderId === userId,
  }));
}

export async function sendMessage(friendId: string, body: string) {
  const userId = await requireUserId();
  const trimmed = body.trim();
  if (!trimmed) return;
  if (!(await areFriends(userId, friendId))) throw new Error("Not friends");

  await prisma.message.create({
    data: { senderId: userId, receiverId: friendId, body: trimmed.slice(0, 2000) },
  });
}
