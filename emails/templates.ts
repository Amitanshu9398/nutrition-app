function shell(title: string, body: string) {
  return `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f4f6f8;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <tr><td style="background:#10b981;padding:24px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;">Fuel Lab</span>
            </td></tr>
            <tr><td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">${title}</h1>
              ${body}
            </td></tr>
            <tr><td style="padding:20px 32px;background:#f9fafb;">
              <span style="font-size:12px;color:#9ca3af;">You're receiving this because you use Fuel Lab.</span>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`;
}

export function nutritionistNotificationEmail(params: {
  clientName: string;
  clientPhone: string;
  dashboardUrl: string;
}) {
  const body = `
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      <strong>${params.clientName}</strong> just completed their intake form.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">Phone: ${params.clientPhone}</p>
    <a href="${params.dashboardUrl}" style="display:inline-block;margin-top:16px;background:#10b981;color:#fff;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;">
      View full response
    </a>`;
  return shell("New client submission", body);
}

export function clientConfirmationEmail(params: { clientName: string }) {
  const body = `
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      Hi ${params.clientName}, thanks for completing your nutrition intake form — we've received your
      answers and your nutritionist will review them before your session.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;">
      No action is needed from you right now. We'll be in touch shortly.
    </p>`;
  return shell("We received your intake form", body);
}
