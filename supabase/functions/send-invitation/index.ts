
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  shareToken: string;
  recipientEmail: string;
  momentTitle: string;
  senderName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken, recipientEmail, momentTitle, senderName }: InvitationRequest = await req.json();

    console.log('Sending invitation email:', { shareToken, recipientEmail, momentTitle, senderName });

    const shareUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/shared/${shareToken}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Momento Compartido</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f9fafb; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; color: #7c3aed; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .moment-card { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .moment-title { font-size: 20px; font-weight: 600; color: #6b21a8; margin: 0 0 10px 0; }
            .shared-by { color: #6b7280; font-size: 14px; }
            .cta-button { display: inline-block; background: #f472b6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .cta-button:hover { background: #ec4899; }
            .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💝 Momento Especial Compartido</h1>
            </div>
            <div class="content">
              <p>¡Hola!</p>
              <p><strong>${senderName}</strong> ha compartido un momento especial contigo:</p>
              
              <div class="moment-card">
                <div class="moment-title">${momentTitle}</div>
                <div class="shared-by">Compartido por ${senderName}</div>
              </div>
              
              <p>Haz clic en el botón de abajo para ver este momento:</p>
              
              <div style="text-align: center;">
                <a href="${shareUrl}" class="cta-button">Ver Momento 💫</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${shareUrl}" style="color: #7c3aed;">${shareUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Este es un momento especial compartido desde nuestra plataforma de recuerdos.</p>
              <p>Si no esperabas este correo, puedes ignorarlo de forma segura.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Momentos <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${senderName} compartió un momento especial contigo: "${momentTitle}"`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error sending email' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
