import { LogOut } from "lucide-react";
import { logout } from "@/data/static";

export function SignOutButton() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-4 h-px bg-border" />
      <button
        onClick={() => logout()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-transparent px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}
