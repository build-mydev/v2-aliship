import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function SubPageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-primary px-3 text-primary-foreground shadow-sm">
      <button
        onClick={() => router.history.back()}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-primary-foreground/10"
        aria-label="Back"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <h1 className="flex-1 text-center text-base font-semibold">{title}</h1>
      <div className="flex h-9 w-9 items-center justify-center">{right}</div>
    </div>
  );
}
