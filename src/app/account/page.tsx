import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/account" user={user} />
      <main className="flex-1 overflow-auto px-9 py-7">
        <h1 className="font-serif text-xl font-semibold text-slate-900">My Account</h1>
        <p className="mt-1 text-sm text-slate-500">Your profile details.</p>

        <div className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6">
          <Field label="Name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Exam Date" value={user.examDate ?? "Not set"} last />
        </div>

        <p className="mt-4 max-w-md text-xs text-slate-400">
          Editing these details isn&apos;t available yet — that&apos;s coming soon.
        </p>
      </main>
    </div>
  );
}

function Field({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-slate-100"}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
