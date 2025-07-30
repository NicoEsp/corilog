-- Fix the ambiguous column reference in update_user_streak_optimized function
CREATE OR REPLACE FUNCTION public.update_user_streak_optimized(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, current_streak integer, longest_streak integer, last_activity_date date, streak_start_date date, last_reward_date timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_streak_data RECORD;
  v_existing_streak RECORD;
  v_result RECORD;
BEGIN
  -- Calculate current streak
  SELECT * INTO v_streak_data
  FROM public.calculate_user_streak(p_user_id);
  
  -- Get existing streak record with proper table alias
  SELECT * INTO v_existing_streak
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id;
  
  IF v_existing_streak IS NULL THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (
      user_id,
      current_streak,
      longest_streak,
      last_activity_date,
      streak_start_date
    ) VALUES (
      p_user_id,
      v_streak_data.current_streak,
      v_streak_data.longest_streak,
      v_streak_data.last_activity_date,
      v_streak_data.streak_start_date
    )
    RETURNING * INTO v_result;
  ELSE
    -- Update existing record with proper table alias
    UPDATE public.user_streaks us
    SET 
      current_streak = v_streak_data.current_streak,
      longest_streak = GREATEST(us.longest_streak, v_streak_data.longest_streak),
      last_activity_date = v_streak_data.last_activity_date,
      streak_start_date = CASE 
        WHEN v_streak_data.current_streak > 0 THEN v_streak_data.streak_start_date
        ELSE NULL
      END,
      updated_at = now()
    WHERE us.user_id = p_user_id
    RETURNING * INTO v_result;
  END IF;
  
  RETURN QUERY SELECT 
    v_result.id,
    v_result.user_id,
    v_result.current_streak,
    v_result.longest_streak,
    v_result.last_activity_date,
    v_result.streak_start_date,
    v_result.last_reward_date,
    v_result.created_at,
    v_result.updated_at;
END;
$function$