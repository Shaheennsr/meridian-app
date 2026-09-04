"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
