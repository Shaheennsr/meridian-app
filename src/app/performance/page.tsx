import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { ComingSoon } from "@/components/coming-soon";

export default async function PerformancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/performance" user={user} />
      <ComingSoon
        title="Performance Analytics"
        description="Deeper trend charts and score breakdowns beyond the Dashboard summary are coming here soon."
      />
    </div>
  );
}
