import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-white font-bold text-sm">
            M
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight">Meridian</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 leading-tight">Board Review</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-4 py-2 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900">
          Master Step 2 CK with confidence.
        </h1>
        <p className="mt-4 max-w-md text-slate-600">
          12,400 board-style questions, adaptive blocks, and tutor-mode explanations that adapt to how you study.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-teal-600 hover:bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 hover:bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
