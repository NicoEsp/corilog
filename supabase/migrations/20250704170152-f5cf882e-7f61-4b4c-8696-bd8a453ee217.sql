
-- Add is_featured column to moments table
ALTER TABLE public.moments 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when filtering featured moments
CREATE INDEX idx_moments_is_featured ON public.moments (is_featured);

-- Create index for featured moments ordering (featured first, then by date)
CREATE INDEX idx_moments_featured_date ON public.moments (is_featured DESC, date DESC);
