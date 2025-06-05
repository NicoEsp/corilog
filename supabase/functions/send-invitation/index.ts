
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Enhanced input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

const validateShareToken = (token: string): boolean => {
  return typeof token === 'string' && token.length > 0 && token.length <= 100;
};

const validateMomentTitle = (title: string): boolean => {
  return typeof title === 'string' && title.trim().length > 0 && title.length <= 200;
};

const validateSenderName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
};

const validateSiteUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow https and localhost for development
    return parsedUrl.protocol === 'https:' || 
           (parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost');
  } catch {
    return false;
  }
};

// Rate limiting function
const checkRateLimit = (userId: string): { allowed: boolean; resetTime?: number } => {
  const now = Date.now();
  const key = `email_${userId}`;
  const limit = rateLimitStore.get(key);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit (5 emails per hour)
    rateLimitStore.set(key, { count: 1, resetTime: now + 3600000 });
    return { allowed: true };
  }
  
  if (limit.count >= 5) {
    return { allowed: false, resetTime: limit.resetTime };
  }
  
  limit.count++;
  return { allowed: true };
};

// Sanitize string inputs
const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://xgukkzjwudbxyiohspsv.supabase.co';

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY configuration');
    }

    if (!validateSiteUrl(siteUrl)) {
      throw new Error('Invalid SITE_URL configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      const resetTime = new Date(rateLimitCheck.resetTime!);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Try again later.',
          resetTime: resetTime.toISOString()
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { shareToken, recipientEmail, momentTitle, senderName } = body;

    // Comprehensive input validation
    if (!validateShareToken(shareToken)) {
      throw new Error('Invalid share token format');
    }

    if (!validateEmail(recipientEmail)) {
      throw new Error('Invalid recipient email format');
    }

    if (!validateMomentTitle(momentTitle)) {
      throw new Error('Invalid moment title');
    }

    if (!validateSenderName(senderName)) {
      throw new Error('Invalid sender name');
    }

    // Sanitize inputs
    const sanitizedEmail = recipientEmail.toLowerCase().trim();
    const sanitizedTitle = sanitizeString(momentTitle);
    const sanitizedSender = sanitizeString(senderName);

    // Verify the share token belongs to the authenticated user
    const { data: shareData, error: shareError } = await supabase
      .from('shared_moments')
      .select('id, moment_id, expires_at')
      .eq('share_token', shareToken)
      .eq('shared_by_user_id', user.id)
      .single();

    if (shareError || !shareData) {
      throw new Error('Invalid or unauthorized share token');
    }

    // Check if share token is still valid
    if (shareData.expires_at && new Date(shareData.expires_at) <= new Date()) {
      throw new Error('Share token has expired');
    }

    // Create the share URL
    const shareUrl = `${siteUrl}/shared/${shareToken}`;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Corilog <noreply@xgukkzjwudbxyiohspsv.supabase.co>',
        to: [sanitizedEmail],
        subject: `${sanitizedSender} te ha compartido un momento especial`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B5A3C; font-size: 28px; margin-bottom: 10px;">✨ Corilog</h1>
              <p style="color: #6B7280; font-style: italic;">Tu diario privado digital</p>
            </div>
            
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #374151; margin-top: 0;">Tienes un momento especial compartido</h2>
              <p style="color: #6B7280; font-size: 16px; line-height: 1.5;">
                <strong>${sanitizedSender}</strong> ha compartido contigo el momento especial:
              </p>
              <p style="color: #8B5A3C; font-size: 18px; font-weight: 600; margin: 16px 0;">
                "${sanitizedTitle}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${shareUrl}" 
                 style="display: inline-block; background: #FB7185; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Ver momento compartido
              </a>
            </div>
            
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 32px;">
              <p style="color: #9CA3AF; font-size: 14px; text-align: center;">
                Este enlace es privado y personal. No lo compartas con nadie más.
              </p>
              <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 16px;">
                Este email fue enviado desde Corilog. Si no esperabas este mensaje, puedes ignorarlo de forma segura.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error('Failed to send invitation email');
    }

    const emailResult = await emailResponse.json();
    
    console.log('Email sent successfully:', {
      id: emailResult.id,
      to: sanitizedEmail,
      shareToken: shareToken.substring(0, 8) + '...' // Log partial token for debugging
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        emailId: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Send invitation error:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('Rate limit') ? 429 : 
                      errorMessage.includes('Invalid') || errorMessage.includes('unauthorized') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
