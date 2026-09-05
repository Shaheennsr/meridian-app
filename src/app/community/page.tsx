import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { getCommunityData } from "@/lib/actions/community";
import { CommunityClient } from "@/components/community-client";

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const { friends, incomingRequests } = await getCommunityData();

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/community" user={user} />
      <CommunityClient friends={friends} incomingRequests={incomingRequests} />
    </div>
  );
}
