import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { initials, formatDate } from "@/lib/utils";
import { ClientsToolbar } from "@/components/dashboard/clients-toolbar";
import { Card } from "@/components/ui/card";
import type { ClientStatus } from "@/types";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<ClientStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  archived: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "all";
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("nutritionist_id", user!.id);

  if (q) query = query.ilike("name", `%${q}%`);
  if (status !== "all") query = query.eq("status", status);

  query = query.order("created_at", { ascending: sort === "oldest" });
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: clients, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <p className="mt-1 text-sm text-muted-foreground">{count ?? 0} total</p>

      <div className="mt-6">
        <ClientsToolbar defaultQuery={q} defaultStatus={status} defaultSort={sort} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="hidden px-5 py-3 sm:table-cell">Phone</th>
              <th className="px-5 py-3">Status</th>
              <th className="hidden px-5 py-3 md:table-cell">Tags</th>
              <th className="px-5 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {(clients || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  No clients found.
                </td>
              </tr>
            )}
            {(clients || []).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <Link href={`/dashboard/clients/${c.id}`} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {initials(c.name)}
                    </div>
                    <span className="font-medium hover:underline">{c.name}</span>
                  </Link>
                </td>
                <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{c.phone}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[c.status as ClientStatus]}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </td>
                <td className="hidden px-5 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(c.tags || []).map((t: string) => (
                      <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-secondary"
              href={{ query: { ...params, page: page - 1 } }}
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-secondary"
              href={{ query: { ...params, page: page + 1 } }}
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
