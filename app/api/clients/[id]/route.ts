import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/utils";

const updateSchema = z.object({
  status: z.enum(["new", "active", "in_progress", "completed", "archived"]).optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
  notes: z.string().max(5000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (parsed.data.status) payload.status = parsed.data.status;
  if (parsed.data.tags) payload.tags = parsed.data.tags.map((t) => sanitizeText(t, 30));
  if (parsed.data.notes !== undefined) payload.notes = sanitizeText(parsed.data.notes, 5000);

  // RLS also enforces this, but we double-check the row belongs to the caller.
  const { data, error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", id)
    .eq("nutritionist_id", user.id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("clients").delete().eq("id", id).eq("nutritionist_id", user.id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
