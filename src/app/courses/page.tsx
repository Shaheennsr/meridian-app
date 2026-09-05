import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { CoursesClient } from "@/components/courses-client";

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/courses" user={user} />
      <CoursesClient userName={user.name} />
    </div>
  );
}
