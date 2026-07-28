import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/dashboard/logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            N
          </div>
          NutriIntake
        </div>
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent hover:text-accent-foreground">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link href="/dashboard/clients" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent hover:text-accent-foreground">
            <Users className="h-4 w-4" /> Clients
          </Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
