import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function SubPageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-primary px-3 text-primary-foreground shadow-sm">
      <button
        onClick={() => router.history.back()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-primary-foreground/10"
        aria-label="Back"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-base font-semibold">{title}</h1>
      <div className="flex h-9 min-w-9 shrink-0 items-center justify-center">{right}</div>
    </div>
  );
}
