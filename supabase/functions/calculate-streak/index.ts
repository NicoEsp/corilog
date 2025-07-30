import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      moments: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          created_at: string;
          updated_at: string;
          is_featured: boolean;
          title: string;
          note: string;
          photo: string | null;
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          streak_start_date: string | null;
          last_reward_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

Deno.serve(async (req) => {
  console.log('Calculate streak function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Calculating streak for user:', userId);

    // Use SQL to efficiently calculate streak
    const { data: streakData, error: streakError } = await supabase.rpc('calculate_user_streak', {
      p_user_id: userId
    });

    if (streakError) {
      console.error('Error calculating streak:', streakError);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate streak' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Streak calculated successfully:', streakData);

    return new Response(
      JSON.stringify({
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        lastActivityDate: streakData?.last_activity_date,
        streakStartDate: streakData?.streak_start_date
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in calculate-streak function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});