import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WaitlistPayload {
  name: string;
  email: string;
  hurdles?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured in Supabase Edge Function secrets");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, email } = (await req.json()) as WaitlistPayload;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resend = new Resend(resendApiKey);
    const fromAddress =
      Deno.env.get("EMAIL_FROM") || "Loomette <hi@loomette.id>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email.trim().toLowerCase()],
      subject: "You're on the Loomette waitlist!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're on the Loomette waitlist</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #fafaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafaf7; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" max-width="540px" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(120, 113, 108, 0.2); padding: 40px 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
                    <tr>
                      <td>
                        <div style="margin-bottom: 24px;">
                          <span style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; color: #1e293b; letter-spacing: -0.02em;">
                            loomette
                          </span>
                        </div>

                        <div style="display: inline-block; background-color: #ede8e1; border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #333333; margin-bottom: 20px;">
                          Early Access
                        </div>

                        <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: normal; line-height: 1.15; color: #1e293b; margin: 0 0 16px 0;">
                          Your wardrobe,<br/><em>finally organized.</em>
                        </h1>

                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                          Hi ${name ? name.trim() : "there"},
                        </p>

                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                          Thank you for joining the Loomette waitlist! Your early access spot has been reserved.
                        </p>

                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                          We are gradually unlocking access in waves so we can give every member the best experience possible. As soon as your wave is ready, we'll send your invite right here to <strong>${email.trim()}</strong>.
                        </p>

                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

                        <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin: 0;">
                          Loomette
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Handler error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
