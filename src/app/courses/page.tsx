import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

const FOLDERS = [
  { name: "Folder 1", count: "0 videos" },
  { name: "Folder 2", count: "0 videos" },
  { name: "Folder 3", count: "0 videos" },
  { name: "Folder 4", count: "0 videos" },
  { name: "Folder 5", count: "0 videos" },
  { name: "Folder 6", count: "0 videos" },
  { name: "Folder 7", count: "0 videos" },
  { name: "Folder 8", count: "0 videos" },
];

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen flex-1 overflow-hidden bg-navy-50">
      <Sidebar activeHref="/courses" user={user} />
      <main className="flex-1 overflow-auto px-9 py-7">
        <h1 className="font-serif text-xl font-semibold text-slate-900">Courses & Videos</h1>
        <p className="mt-1 text-sm text-slate-500">Organize your video lessons into folders.</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FOLDERS.map((folder) => (
            <button
              key={folder.name}
              type="button"
              className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700 group-hover:bg-teal-100 group-hover:text-teal-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                </svg>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{folder.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">{folder.count}</div>
            </button>
          ))}
        </div>

        <p className="mt-6 max-w-md text-xs text-slate-400">
          Rename these folders and add videos to them once your content is ready.
        </p>
      </main>
    </div>
  );
}
