import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientProfile } from "@/components/dashboard/client-profile";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: responses }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("intake_responses")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!client) notFound();

  return <ClientProfile client={client} responses={responses || []} />;
}
