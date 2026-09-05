import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const FEATURES = [
  {
    title: "Tutor Mode explanations",
    description: "Every item unlocks a full explanation the moment you answer it — not just the correct letter.",
    icon: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    title: "Real performance tracking",
    description: "See your accuracy break down by specialty as you go, so you know exactly where to focus next.",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </>
    ),
  },
  {
    title: "Board-style vignettes",
    description: "Written in NBME-style clinical-vignette format across 13 specialties.",
    icon: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="1.5" />
        <line x1="9" y1="4" x2="9" y2="20" />
      </>
    ),
  },
  {
    title: "Custom blocks",
    description: "Choose which specialties to drill and how many questions per block — 10 to 40 at a time.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" />
      </>
    ),
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const [totalQuestions, categories] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ["category"] }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-navy-50">
      {/* Nav */}
      <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-12">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">Meridian</span>
        </div>
        <nav className="hidden items-center gap-9 text-sm font-medium text-slate-600 md:flex">
          <span>Question Bank</span>
          <span>Performance Analytics</span>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-navy-700 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-600"
          >
            Create Free Account
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center gap-16 px-6 py-16 sm:px-12 lg:flex-row lg:items-center lg:py-20">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {totalQuestions} board-style questions across {categories.length} specialties
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Master Step 2 CK with confidence.
          </h1>
          <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-slate-600">
            Board-style vignettes, randomized blocks, and Tutor Mode explanations that reveal the reasoning
            behind every answer as soon as you submit it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-navy-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-white"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-10 flex gap-9">
            <Stat value={totalQuestions.toString()} label="practice questions" />
            <Stat value={categories.length.toString()} label="specialties covered" />
            <Stat value="10–40" label="questions per block" />
          </div>
        </div>

        {/* Product preview */}
        <div className="w-full max-w-md flex-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(20,20,25,0.12)]">
            <div className="flex h-[34px] items-center gap-1.5 bg-navy-700 px-3.5">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="h-2 w-2 rounded-full bg-white/30" />
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Cardiology &middot; Acute Coronary Syndrome</span>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                  Item 3
                </span>
              </div>
              <div className="mb-1.5 h-2 w-full rounded bg-slate-100" />
              <div className="mb-1.5 h-2 w-[94%] rounded bg-slate-100" />
              <div className="mb-5 h-2 w-[70%] rounded bg-slate-100" />
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3.5 py-3">
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border-[1.5px] border-slate-300" />
                  <span className="h-2 w-[80%] rounded bg-slate-100" />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border-2 border-emerald-500 bg-emerald-50 px-3.5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500" />
                    <span className="h-2 w-[85%] rounded bg-emerald-200" />
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3.5 py-3 opacity-50">
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border-[1.5px] border-slate-300" />
                  <span className="h-2 w-[65%] rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 sm:px-12">
        <div className="mx-auto mb-13 max-w-xl text-center">
          <div className="mb-2.5 text-[12.5px] font-semibold uppercase tracking-wider text-teal-600">
            Why Meridian
          </div>
          <h2 className="font-serif text-3xl font-semibold text-slate-900">Built around how you actually learn</h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4.5 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  {f.icon}
                </svg>
              </div>
              <div className="mb-2 text-[15px] font-semibold text-slate-900">{f.title}</div>
              <div className="text-[13px] leading-relaxed text-slate-500">{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center sm:px-12">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
          Start practicing in under a minute
        </h2>
        <p className="mt-3 text-[14.5px] text-slate-500">Free to create an account. No payment required.</p>
        <Link
          href="/register"
          className="mt-7 inline-flex rounded-md bg-navy-700 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
        >
          Create your free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-8 sm:flex-row sm:px-12">
        <div className="flex items-center gap-2.5">
          <Logo size={22} />
          <span className="text-[13px] text-slate-500">&copy; 2026 Meridian Board Review</span>
        </div>
        <div className="flex gap-7 text-[13px] text-slate-500">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </footer>
    </div>
  );
}

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" className="fill-teal-500" />
      <rect x="11" y="18" width="5" height="10" rx="1.5" fill="white" />
      <rect x="20" y="11" width="5" height="17" rx="1.5" fill="white" />
    </svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
