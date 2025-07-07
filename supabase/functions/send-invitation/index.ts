
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const siteUrl = Deno.env.get('SITE_URL') || 'https://corilog.app';

// CORS más flexible que permite tanto desarrollo como producción
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Permite todos los orígenes
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

interface InvitationRequest {
  shareToken: string;
  recipientEmails: string[];
  momentTitle: string;
  senderName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INICIO ENVÍO INVITACIONES ===');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { shareToken, recipientEmails, momentTitle, senderName }: InvitationRequest = requestBody;
    
    console.log('Datos extraídos:', { shareToken, recipientEmails, momentTitle, senderName });

    if (!shareToken || !recipientEmails || recipientEmails.length === 0) {
      console.log('ERROR: Faltan datos requeridos');
      return new Response(JSON.stringify({ 
        error: 'Faltan datos requeridos',
        details: 'shareToken y recipientEmails son obligatorios'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!resendApiKey) {
      console.log('ERROR: RESEND_API_KEY no configurada');
      return new Response(JSON.stringify({ 
        error: 'Configuración de email no disponible' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const shareUrl = `${siteUrl}/shared/${shareToken}`;
    console.log('URL compartida:', shareUrl);
    
    // Send emails using Resend
    const emailResults = [];
    
    for (const email of recipientEmails) {
      console.log(`Enviando email a: ${email}`);
      
      // Codificar el email en base64 para la URL
      const encodedEmail = btoa(email);
      const emailShareUrl = `${shareUrl}?email=${encodedEmail}`;
      
      console.log(`URL con email codificado: ${emailShareUrl}`);
      
      const emailData = {
        from: 'Corilog <no-reply@corilog.app>',
        to: [email],
        subject: `${senderName} compartió un momento especial contigo`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4a5568; font-size: 28px; margin: 0;">Corilog</h1>
                <p style="color: #718096; margin: 10px 0 0 0;">Momentos que importan</p>
              </div>
              
              <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">¡Tienes un momento especial esperándote!</h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                <strong>${senderName}</strong> quiere compartir contigo el momento "${momentTitle}".
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${emailShareUrl}" 
                   style="background-color: #e53e3e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
                  Ver Momento
                </a>
              </div>
              
              <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                Este enlace es personal y privado. Solo tú puedes acceder a este momento especial.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
                Este mensaje fue enviado desde Corilog. Si no esperabas este email, puedes ignorarlo.
              </p>
            </div>
          </div>
        `,
      };

      console.log('Datos del email:', emailData);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const responseData = await response.text();
      console.log(`Respuesta de Resend para ${email}:`, {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (!response.ok) {
        console.error(`Error sending email to ${email}:`, {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        emailResults.push({
          email,
          success: false,
          error: `Error ${response.status}: ${responseData}`
        });
      } else {
        console.log(`Email sent successfully to ${email}`);
        emailResults.push({
          email,
          success: true,
          data: responseData
        });
      }
    }

    console.log('Resultados de envío:', emailResults);
    
    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;
    
    if (successCount === 0) {
      console.log('ERROR: No se pudo enviar ningún email');
      return new Response(JSON.stringify({ 
        error: 'No se pudo enviar ningún email',
        details: emailResults.filter(r => !r.success).map(r => r.error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`=== ENVÍO COMPLETADO: ${successCount} exitosos, ${failureCount} fallidos ===`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `${successCount} invitación(es) enviada(s) exitosamente`,
      results: emailResults
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("=== ERROR GENERAL ===", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
