import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  type: "approved" | "rejected";
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, reason }: NotificationRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    let subject: string;
    let htmlContent: string;

    if (type === "approved") {
      subject = "Your Account Has Been Approved - RecruitFlow";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
            .button { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ RecruitFlow</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Congratulations! Your Account is Approved</h2>
              <p>Great news! Your account request has been reviewed and approved by our administrator.</p>
              <p>You now have full access to the RecruitFlow platform where you can:</p>
              <ul>
                <li>Manage candidates through the recruitment pipeline</li>
                <li>Track documents and stage completions</li>
                <li>Generate reports and analytics</li>
                <li>Collaborate with your team</li>
              </ul>
              <p>Welcome aboard!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RecruitFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Account Request Update - RecruitFlow";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
            .reason-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ RecruitFlow</h1>
            </div>
            <div class="content">
              <div class="info-icon">ℹ️</div>
              <h2>Account Request Update</h2>
              <p>We regret to inform you that your account request could not be approved at this time.</p>
              ${reason ? `
              <div class="reason-box">
                <strong>Reason:</strong>
                <p>${reason}</p>
              </div>
              ` : ''}
              <p>If you believe this was a mistake or have questions, please contact your administrator.</p>
              <p>Thank you for your understanding.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RecruitFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RecruitFlow <noreply@zenovait.com>",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to send email");
    }

    const emailResponse = await res.json();
    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
