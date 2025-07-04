-- Create shared_moments table for private moment sharing
CREATE TABLE public.shared_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  shared_by_user_id UUID NOT NULL,
  share_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  recipient_email_1 TEXT NOT NULL,
  recipient_email_2 TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count_email_1 INTEGER NOT NULL DEFAULT 0,
  view_count_email_2 INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_moments ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_moments
CREATE POLICY "Users can view their own shared moments" 
ON public.shared_moments 
FOR SELECT 
USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can create their own shared moments" 
ON public.shared_moments 
FOR INSERT 
WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can update their own shared moments" 
ON public.shared_moments 
FOR UPDATE 
USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete their own shared moments" 
ON public.shared_moments 
FOR DELETE 
USING (auth.uid() = shared_by_user_id);

-- Create policy for public access to shared moments (for viewing)
CREATE POLICY "Public can view shared moments with valid token" 
ON public.shared_moments 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create function to update timestamps
CREATE TRIGGER update_shared_moments_updated_at
BEFORE UPDATE ON public.shared_moments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_shared_moments_share_token ON public.shared_moments (share_token);
CREATE INDEX idx_shared_moments_moment_id ON public.shared_moments (moment_id);
CREATE INDEX idx_shared_moments_user_id ON public.shared_moments (shared_by_user_id);