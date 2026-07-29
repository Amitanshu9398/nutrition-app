import { Resend } from "resend";
import { nutritionistNotificationEmail, clientConfirmationEmail } from "@/emails/templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendSubmissionEmails(params: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  dashboardUrl: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  const notifyTo = (process.env.NUTRITIONIST_NOTIFY_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const tasks: Promise<unknown>[] = [];

  if (notifyTo.length) {
    tasks.push(
      resend.emails.send({
        from: process.env.EMAIL_FROM || "Fuel Lab <onboarding@resend.dev>",
        to: notifyTo,
        subject: `New intake: ${params.clientName}`,
        html: nutritionistNotificationEmail({
          clientName: params.clientName,
          clientPhone: params.clientPhone,
          dashboardUrl: params.dashboardUrl,
        }),
      })
    );
  }

  if (params.clientEmail) {
    tasks.push(
      resend.emails.send({
        from: process.env.EMAIL_FROM || "Fuel Lab <onboarding@resend.dev>",
        to: params.clientEmail,
        subject: "We received your intake form",
        html: clientConfirmationEmail({ clientName: params.clientName }),
      })
    );
  }

  // Emails should never block or fail the submission itself.
  const results = await Promise.allSettled(tasks);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  });
}
