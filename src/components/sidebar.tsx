import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "grid", label: "Dashboard" },
  { href: "/blocks/new", icon: "book", label: "Question Bank" },
  { href: "/performance", icon: "chart", label: "Performance" },
  { href: "/study-plan", icon: "calendar", label: "Study Plan" },
  { href: "/courses", icon: "play", label: "Courses & Videos" },
  { href: "/community", icon: "chat", label: "Community" },
  { href: "/account", icon: "user", label: "My Account" },
] as const;

export function Sidebar({
  activeHref,
  user,
}: {
  activeHref: string;
  user: { name: string; email: string };
}) {
  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col bg-navy-700 px-4 py-5 text-white">
      <Link href="/dashboard" className="mb-9 flex items-center gap-2.5 px-2">
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" className="fill-teal-500" />
          <rect x="11" y="18" width="5" height="10" rx="1.5" fill="white" />
          <rect x="20" y="11" width="5" height="17" rx="1.5" fill="white" />
        </svg>
        <span className="text-[15px] font-semibold">Meridian</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={activeHref === item.href} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="rounded-lg bg-white/[0.06] p-3.5">
          <div className="mb-1 text-xs font-semibold">{user.name}</div>
          <div className="text-[11px] text-white/60">{user.email}</div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}

type IconName = "grid" | "book" | "chart" | "calendar" | "play" | "user" | "chat";

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: IconName;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
        active ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <NavIcon icon={icon} />
      </svg>
      <span>{label}</span>
    </Link>
  );
}

function NavIcon({ icon }: { icon: IconName }) {
  switch (icon) {
    case "grid":
      return (
        <>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
      );
    case "book":
      return (
        <>
          <rect x="5" y="4" width="14" height="16" rx="1.5" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </>
      );
    case "chart":
      return (
        <>
          <line x1="4" y1="20" x2="20" y2="20" />
          <rect x="6" y="12" width="3" height="6" />
          <rect x="11" y="8" width="3" height="10" />
          <rect x="16" y="4" width="3" height="14" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="4" y="5" width="16" height="15" rx="1.5" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        </>
      );
    case "play":
      return <polygon points="6 4 20 12 6 20 6 4" />;
    case "chat":
      return (
        <>
          <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
        </>
      );
    case "user":
      return (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </>
      );
  }
}
