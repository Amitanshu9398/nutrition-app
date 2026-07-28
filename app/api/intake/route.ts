import { NextRequest, NextResponse } from "next/server";
import { intakeSubmitSchema } from "@/lib/validation";
import { sanitizeAnswerValue, sanitizeText } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendSubmissionEmails } from "@/lib/email";
import { INTAKE_SECTIONS } from "@/lib/intake-sections";

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit by IP ────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rl = await checkRateLimit(`intake:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = intakeSubmitSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { clientInfo, answers } = parsed.data;

    // ── Resolve which nutritionist this submission belongs to ──────────
    // For a single-practitioner deployment this is the only nutritionist
    // row in the table. Multi-practitioner deployments should instead pass
    // a nutritionist slug/id in the intake link — left as a documented
    // extension point (see README § Multi-tenant intake links).
    const supabase = createAdminClient();
    const { data: nutritionist, error: nutritionistErr } = await supabase
      .from("nutritionists")
      .select("id")
      .limit(1)
      .single();

    if (nutritionistErr || !nutritionist) {
      console.error("[api/intake] no nutritionist configured", nutritionistErr);
      return NextResponse.json(
        { error: "This intake form isn't accepting submissions right now." },
        { status: 503 }
      );
    }

    // ── Sanitize free text ───────────────────────────────────────────────
    const cleanName = sanitizeText(clientInfo.name, 100);
    const cleanPhone = sanitizeText(clientInfo.phone, 20);
    const cleanEmail = clientInfo.email ? sanitizeText(clientInfo.email, 200) : null;

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .insert({
        nutritionist_id: nutritionist.id,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        status: "new",
      })
      .select("id")
      .single();

    if (clientErr || !client) {
      console.error("[api/intake] client insert failed", clientErr);
      return NextResponse.json({ error: "Could not save your submission." }, { status: 500 });
    }

    // ── Write each answer as a row, tagged with its section ─────────────
    const rows = INTAKE_SECTIONS.flatMap((section) =>
      section.questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({
          client_id: client.id,
          section_id: section.key,
          question_id: q.id,
          question_label: q.label,
          answer: sanitizeAnswerValue(answers[q.id]),
        }))
    );

    if (rows.length) {
      const { error: responsesErr } = await supabase.from("intake_responses").insert(rows);
      if (responsesErr) {
        console.error("[api/intake] responses insert failed", responsesErr);
        return NextResponse.json({ error: "Could not save your answers." }, { status: 500 });
      }
    }

    await supabase.from("activity_log").insert({
      nutritionist_id: nutritionist.id,
      client_id: client.id,
      event_type: "submission",
      detail: `${cleanName} submitted their intake form`,
    });

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${client.id}`;
    await sendSubmissionEmails({
      clientName: cleanName,
      clientPhone: cleanPhone,
      clientEmail: cleanEmail || undefined,
      dashboardUrl,
    });

    return NextResponse.json({ success: true, clientId: client.id }, { status: 201 });
  } catch (err) {
    console.error("[api/intake] unexpected error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
