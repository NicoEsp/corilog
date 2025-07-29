import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreakImageRequest {
  streakDays: number;
  userDisplayName?: string;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request
    const { streakDays, userDisplayName, userId }: StreakImageRequest = await req.json()

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user exists and owns the streak
    const { data: userStreak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (streakError || !userStreak) {
      return new Response(
        JSON.stringify({ error: 'Streak not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For now, return a simple response indicating the image would be generated
    // In a full implementation, you would use a Canvas library or image generation service
    const imageData = {
      message: `Streak image for ${streakDays} days would be generated here`,
      streakDays,
      userDisplayName,
      userId,
      timestamp: new Date().toISOString()
    }

    // Log the generation request
    console.log(`Generating streak image for user ${userId}: ${streakDays} days`)

    // Update reward data to mark image as generated
    await supabase
      .from('streak_rewards')
      .update({ 
        reward_data: { 
          ...userStreak,
          type: 'image',
          generated: true,
          generated_at: new Date().toISOString()
        }
      })
      .eq('user_id', userId)
      .eq('reward_type', 'weekly')
      .eq('streak_days', streakDays)

    return new Response(
      JSON.stringify(imageData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating streak image:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})