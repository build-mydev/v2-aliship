import { Settings } from "lucide-react";

interface Props {
  variant?: "wordmark" | "compact";
  siteName?: string;
  roleBadge?: string;
  showSettings?: boolean;
}

export function HeroBanner({ variant = "wordmark", siteName, roleBadge, showSettings = true }: Props) {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className={variant === "wordmark" ? "px-5 pt-8 pb-4" : "px-5 pt-5 pb-3"}>
        <div className="flex items-baseline gap-2">
          <span
            className={
              "font-wordmark leading-none tracking-tight " +
              (variant === "wordmark" ? "text-[64px]" : "text-4xl")
            }
          >
            ALISHIP
          </span>
          <span className="font-wordmark text-lg opacity-80">express</span>
        </div>
      </div>
      {(siteName || roleBadge) && (
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2 text-xs">
            {siteName && <span className="opacity-90">{siteName}</span>}
            {roleBadge && (
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                {roleBadge}
              </span>
            )}
          </div>
          {showSettings && <Settings className="h-4 w-4 opacity-80" />}
        </div>
      )}
    </div>
  );
}
