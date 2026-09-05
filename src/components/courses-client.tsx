"use client";

import { useMemo, useState } from "react";
import { ProgressRing } from "@/components/progress-ring";

type Item = {
  id: string;
  type: "course" | "video";
  title: string;
  series: string;
  meta: string;
  category: string;
  gradient: string;
  progress: number | null;
};

const ITEMS: Item[] = [
  {
    id: "c1",
    type: "course",
    title: "Heart Failure: Diagnosis to Management",
    series: "Cardiology Core Series · Dr. R. Vance",
    meta: "8 lessons",
    category: "Cardiology",
    gradient: "from-teal-200 to-cyan-300",
    progress: 20,
  },
  {
    id: "v1",
    type: "video",
    title: "Reading ABGs Under Time Pressure",
    series: "Pulmonology · Quick Concept",
    meta: "11:24",
    category: "Pulmonology",
    gradient: "from-green-200 to-lime-300",
    progress: 55,
  },
  {
    id: "c2",
    type: "course",
    title: "Diabetic Emergencies: DKA & HHS",
    series: "Endocrinology Core Series · Dr. L. Nasser",
    meta: "6 lessons",
    category: "Endocrinology",
    gradient: "from-orange-200 to-amber-300",
    progress: 15,
  },
  {
    id: "v2",
    type: "video",
    title: "STEMI: Recognizing the Pattern Fast",
    series: "Cardiology · Quick Concept",
    meta: "8:03",
    category: "Cardiology",
    gradient: "from-red-200 to-rose-300",
    progress: null,
  },
  {
    id: "c3",
    type: "course",
    title: "High-Yield Psychiatric Emergencies",
    series: "Psychiatry Core Series · Dr. M. Osei",
    meta: "10 lessons",
    category: "Psychiatry",
    gradient: "from-purple-200 to-violet-300",
    progress: null,
  },
  {
    id: "v3",
    type: "video",
    title: "Interpreting Renal Function Panels",
    series: "Nephrology · Quick Concept",
    meta: "6:41",
    category: "Nephrology",
    gradient: "from-sky-200 to-blue-300",
    progress: 10,
  },
];

const FILTERS = ["All", "Courses", "Short Videos", "Saved", "Cardiology", "Nephrology", "Endocrinology"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CoursesClient({ userName }: { userName: string }) {
  const [saved, setSaved] = useState<Set<string>>(new Set(["c1", "c2", "v1"]));
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const toggleSaved = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (trimmed && !item.title.toLowerCase().includes(trimmed)) return false;
      if (activeFilter === "All") return true;
      if (activeFilter === "Courses") return item.type === "course";
      if (activeFilter === "Short Videos") return item.type === "video";
      if (activeFilter === "Saved") return saved.has(item.id);
      return item.category === activeFilter;
    });
  }, [query, activeFilter, saved]);

  const savedItems = Array.from(saved)
    .map((id) => ITEMS.find((i) => i.id === id))
    .filter((i): i is Item => i !== undefined);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-[68px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-9">
        <div>
          <div className="text-[17px] font-semibold text-slate-900">Courses &amp; Videos</div>
          <div className="text-[12.5px] text-slate-500">
            Concept walkthroughs and full-length courses, mapped to the question bank
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses & videos"
              className="w-64 rounded-md border border-slate-200 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-500 text-xs font-semibold text-white">
            {initials(userName)}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-auto px-9 py-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            {/* Continue watching hero */}
            <div className="overflow-hidden rounded-xl bg-navy-700 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative flex h-[150px] w-full flex-shrink-0 items-center justify-center rounded-lg bg-white/10 sm:w-[260px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 rounded bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
                    14:52 / 39:10
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-400">
                    Continue Watching
                  </div>
                  <div className="mb-1.5 font-serif text-lg font-semibold text-white">
                    Acid-Base Disorders: A Systematic Approach
                  </div>
                  <div className="mb-4 text-[12.5px] text-white/60">
                    Nephrology Core Series · Lesson 4 of 9 · Dr. A. Whitfield
                  </div>
                  <div className="mb-4 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-teal-400" style={{ width: "38%" }} />
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="rounded-md bg-teal-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600">
                      Resume Lesson
                    </button>
                    <span className="text-xs text-white/50">5 lessons left in this series</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-navy-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Card grid */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div
                    className={`relative flex h-[130px] items-center justify-center bg-gradient-to-br ${item.gradient}`}
                  >
                    <button
                      onClick={() => toggleSaved(item.id)}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={saved.has(item.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={saved.has(item.id) ? "text-teal-600" : "text-slate-500"}
                      >
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
                      </svg>
                    </button>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/40 text-slate-700 backdrop-blur-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 rounded bg-black/50 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
                      {item.type === "course" ? `Course · ${item.meta}` : `Video · ${item.meta}`}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.series}</div>
                    {item.progress !== null && (
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-slate-500">
                  No courses or videos match this filter yet.
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 text-sm font-semibold text-slate-900">Video Study Progress</div>
              <div className="flex items-center gap-4">
                <ProgressRing percent={40} size={72} stroke={7} />
                <div>
                  <div className="text-2xl font-bold text-slate-900">40%</div>
                  <div className="text-xs text-slate-500">18 of 45 lessons</div>
                </div>
              </div>
              <p className="mt-3.5 text-xs text-slate-500">
                You&apos;re pacing ahead of schedule for the Nephrology and Cardiology series.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Saved for Later</div>
                <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {savedItems.length}
                </span>
              </div>
              {savedItems.length === 0 ? (
                <p className="text-xs text-slate-400">Bookmark a course or video to save it here.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br ${item.gradient}`}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900">{item.title}</div>
                        <div className="truncate text-[11px] text-slate-500">
                          {item.type === "course" ? `Course · ${item.meta}` : `Video · ${item.meta}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
