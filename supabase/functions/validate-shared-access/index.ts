
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://corilog.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

interface ValidationRequest {
  shareToken: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken, email }: ValidationRequest = await req.json();
    
    console.log('Validating shared access:', { shareToken, email });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener información del request para logging de seguridad
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Usar la nueva función de seguridad definer para validación
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_shared_moment_access', {
        p_share_token: shareToken,
        p_email: email
      });

    // Log del intento de acceso (sin esperar el resultado)
    supabase.rpc('log_shared_access_attempt', {
      p_share_token: shareToken,
      p_email: email,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_success: !validationError && validationResult && validationResult.length > 0 && validationResult[0]?.access_valid
    }).catch(err => console.error('Error logging access attempt:', err));

    if (validationError) {
      console.error('Error en validación:', validationError);
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Error interno del servidor' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verificar si el acceso es válido
    if (!validationResult || validationResult.length === 0 || !validationResult[0]?.access_valid) {
      console.log('Access denied - invalid token, expired, or unauthorized email');
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Enlace inválido, expirado, o email no autorizado' 
      }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const result = validationResult[0];
    const moment = result.moment_data;
    const profile = result.shared_by_data;
    const sharedByName = profile?.display_name || profile?.email || 'Alguien especial';

    console.log('Successfully validated shared access');

    return new Response(JSON.stringify({ 
      isValid: true,
      moment,
      sharedBy: sharedByName
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error validating shared access:", error);
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: 'Error interno del servidor' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
