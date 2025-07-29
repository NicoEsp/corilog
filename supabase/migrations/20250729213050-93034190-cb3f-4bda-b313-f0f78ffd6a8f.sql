-- Create user_streaks table
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  last_reward_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_streak UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for user_streaks
CREATE POLICY "Users can view their own streak" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create streak_rewards table
CREATE TABLE public.streak_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('weekly', 'monthly')),
  streak_days INTEGER NOT NULL,
  reward_data JSONB,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.streak_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for streak_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.streak_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards" 
ON public.streak_rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for user_streaks updated_at
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();