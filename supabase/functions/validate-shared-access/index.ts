import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get shared moment data
    const { data: sharedMoment, error: sharedError } = await supabase
      .from('shared_moments')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_active', true)
      .single();

    if (sharedError || !sharedMoment) {
      console.log('Shared moment not found or inactive:', sharedError);
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Enlace no válido o expirado' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if expired
    if (sharedMoment.expires_at && new Date(sharedMoment.expires_at) < new Date()) {
      console.log('Shared moment expired');
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Este enlace ha expirado' 
      }), {
        status: 410,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if email is authorized
    const emailLower = email.toLowerCase().trim();
    const isAuthorized = sharedMoment.recipient_email_1 === emailLower || 
                        sharedMoment.recipient_email_2 === emailLower;

    if (!isAuthorized) {
      console.log('Email not authorized:', emailLower);
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'No tienes autorización para ver este momento' 
      }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the actual moment data
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .select('id, title, note, date, photo')
      .eq('id', sharedMoment.moment_id)
      .single();

    if (momentError || !moment) {
      console.log('Moment not found:', momentError);
      return new Response(JSON.stringify({ 
        isValid: false, 
        error: 'Momento no encontrado' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get shared by user info
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('display_name, email')
      .eq('id', sharedMoment.shared_by_user_id)
      .single();

    const sharedByName = profile?.display_name || profile?.email || 'Alguien especial';

    // Update view count
    const viewCountField = sharedMoment.recipient_email_1 === emailLower ? 
      'view_count_email_1' : 'view_count_email_2';
    
    await supabase
      .from('shared_moments')
      .update({ [viewCountField]: sharedMoment[viewCountField] + 1 })
      .eq('id', sharedMoment.id);

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