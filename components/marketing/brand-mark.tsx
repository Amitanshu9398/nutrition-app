import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("group flex flex-col leading-none", className)}>
      <span className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
          F
        </span>
        <span className="font-display text-lg font-bold tracking-tight">FUEL LAB</span>
      </span>
      <span
        className={cn(
          "ml-10 -mt-0.5 text-[10px] font-medium uppercase tracking-widest",
          dark ? "text-white/50" : "text-muted-foreground"
        )}
      >
        by SikdarAmitanshu
      </span>
    </Link>
  );
}
