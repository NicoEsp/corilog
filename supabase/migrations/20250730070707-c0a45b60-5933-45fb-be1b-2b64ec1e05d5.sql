-- Create optimized function to calculate user streak
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id uuid)
RETURNS TABLE(
  current_streak integer,
  longest_streak integer,
  last_activity_date date,
  streak_start_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_last_activity_date date;
  v_streak_start_date date;
  v_check_date date;
  v_today date := CURRENT_DATE;
  v_moment_dates date[];
  v_unique_dates date[];
  v_date date;
  v_prev_date date;
  v_temp_streak integer := 0;
  v_temp_start_date date;
BEGIN
  -- Get all unique moment dates for the user, ordered DESC
  SELECT ARRAY_AGG(DISTINCT m.date ORDER BY m.date DESC)
  INTO v_moment_dates
  FROM public.moments m
  WHERE m.user_id = p_user_id;
  
  -- If no moments, return zeros
  IF v_moment_dates IS NULL OR array_length(v_moment_dates, 1) = 0 THEN
    RETURN QUERY SELECT 0, 0, NULL::date, NULL::date;
    RETURN;
  END IF;
  
  -- Get the most recent activity date
  v_last_activity_date := v_moment_dates[1];
  
  -- Calculate current streak (consecutive days ending today or yesterday)
  v_check_date := v_today;
  
  -- If no moment today, check if there's one yesterday to start counting
  IF NOT (v_today = ANY(v_moment_dates)) THEN
    v_check_date := v_today - INTERVAL '1 day';
  END IF;
  
  -- Count current streak
  FOREACH v_date IN ARRAY v_moment_dates LOOP
    IF v_date = v_check_date::date THEN
      v_current_streak := v_current_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
      
      -- Set start date of current streak
      IF v_streak_start_date IS NULL THEN
        v_streak_start_date := v_date;
      END IF;
    ELSE
      -- Gap found, stop counting current streak
      EXIT;
    END IF;
  END LOOP;
  
  -- Calculate longest streak by checking all possible consecutive sequences
  v_longest_streak := v_current_streak; -- Start with current streak
  v_temp_streak := 0;
  v_prev_date := NULL;
  
  FOREACH v_date IN ARRAY v_moment_dates LOOP
    IF v_prev_date IS NULL OR v_prev_date - v_date = 1 THEN
      -- Consecutive day
      v_temp_streak := v_temp_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
    ELSE
      -- Reset streak
      v_temp_streak := 1;
    END IF;
    v_prev_date := v_date;
  END LOOP;
  
  RETURN QUERY SELECT 
    v_current_streak,
    v_longest_streak,
    v_last_activity_date,
    v_streak_start_date;
END;
$function$;

-- Create index for better performance on moments queries
CREATE INDEX IF NOT EXISTS idx_moments_user_date ON public.moments(user_id, date DESC);

-- Create function to update user streak efficiently
CREATE OR REPLACE FUNCTION public.update_user_streak_optimized(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  current_streak integer,
  longest_streak integer,
  last_activity_date date,
  streak_start_date date,
  last_reward_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
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
  
  -- Get existing streak record
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
    -- Update existing record
    UPDATE public.user_streaks
    SET 
      current_streak = v_streak_data.current_streak,
      longest_streak = GREATEST(longest_streak, v_streak_data.longest_streak),
      last_activity_date = v_streak_data.last_activity_date,
      streak_start_date = CASE 
        WHEN v_streak_data.current_streak > 0 THEN v_streak_data.streak_start_date
        ELSE NULL
      END,
      updated_at = now()
    WHERE user_id = p_user_id
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
$function$;