import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Users, TrendingUp, Clock, Activity as ActivityIcon } from "lucide-react";
import { StatsChart } from "@/components/dashboard/stats-chart";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: totalClients }, { data: recentActivity }, { data: allClients }] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("nutritionist_id", user!.id),
    supabase
      .from("activity_log")
      .select("*")
      .eq("nutritionist_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("clients").select("created_at").eq("nutritionist_id", user!.id),
  ]);

  const now = new Date();
  const thisMonth = (allClients || []).filter((c) => {
    const d = new Date(c.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Build last-6-months submission counts for the chart
  const monthly: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const count = (allClients || []).filter((c) => {
      const cd = new Date(c.created_at);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    monthly.push({ month: label, count });
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your practice.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total clients" value={totalClients ?? 0} />
        <StatCard icon={TrendingUp} label="Submissions this month" value={thisMonth} />
        <StatCard icon={Clock} label="Avg. response time" value="—" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="mb-4 font-semibold">Submissions, last 6 months</h2>
            <StatsChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <ActivityIcon className="h-4 w-4" /> Recent activity
            </h2>
            <ul className="space-y-4">
              {(recentActivity || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
              {(recentActivity || []).map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="text-foreground">{a.detail}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
