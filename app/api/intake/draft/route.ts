import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const draftSchema = z.object({
  sessionToken: z.string().uuid().optional(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  currentStep: z.number().int().min(0),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = draftSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid draft payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { sessionToken, answers, currentStep, clientName, clientPhone, clientEmail } = parsed.data;

  const payload = {
    answers,
    current_step: currentStep,
    client_name: clientName || null,
    client_phone: clientPhone || null,
    client_email: clientEmail || null,
    updated_at: new Date().toISOString(),
  };

  if (sessionToken) {
    const { error } = await supabase
      .from("intake_drafts")
      .update(payload)
      .eq("session_token", sessionToken);
    if (error) return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
    return NextResponse.json({ sessionToken });
  }

  const { data, error } = await supabase
    .from("intake_drafts")
    .insert(payload)
    .select("session_token")
    .single();

  if (error || !data) return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
  return NextResponse.json({ sessionToken: data.session_token });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("intake_drafts")
    .select("*")
    .eq("session_token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  return NextResponse.json(data);
}
