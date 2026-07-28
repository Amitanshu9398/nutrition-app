"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

const STATUSES = ["all", "new", "active", "in_progress", "completed", "archived"];

export function ClientsToolbar({
  defaultQuery,
  defaultStatus,
  defaultSort,
}: {
  defaultQuery: string;
  defaultStatus: string;
  defaultSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(key, value);
    sp.set("page", "1");
    router.push(`${pathname}?${sp.toString()}`);
  }

  const debouncedSearch = useDebouncedCallback((value: string) => setParam("q", value), 400);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          defaultValue={defaultQuery}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <select
        defaultValue={defaultStatus}
        onChange={(e) => setParam("status", e.target.value)}
        className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All statuses" : s.replace("_", " ")}
          </option>
        ))}
      </select>
      <select
        defaultValue={defaultSort}
        onChange={(e) => setParam("sort", e.target.value)}
        className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
