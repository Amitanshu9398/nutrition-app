import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sanitizeAnswerValue } from "@/lib/utils";

const updateSchema = z.object({
  answer: z.union([z.string(), z.array(z.string())]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const { responseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  // RLS confirms the response belongs to a client owned by this nutritionist.
  const { data, error } = await supabase
    .from("intake_responses")
    .update({ answer: sanitizeAnswerValue(parsed.data.answer) })
    .eq("id", responseId)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  await supabase.from("activity_log").insert({
    nutritionist_id: user.id,
    client_id: data.client_id,
    event_type: "note_added",
    detail: `Edited response: ${data.question_label}`,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const { responseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("intake_responses").delete().eq("id", responseId);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
