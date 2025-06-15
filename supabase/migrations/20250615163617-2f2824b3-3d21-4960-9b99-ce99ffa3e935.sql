
-- Create a table to store app download links
CREATE TABLE public.app_download_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  download_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one active link per platform
  UNIQUE(platform)
);

-- Insert default records for both platforms
INSERT INTO public.app_download_links (platform, download_url, is_active) VALUES 
('android', null, false),
('ios', null, false);

-- Enable Row Level Security (make it publicly readable since download links should be public)
ALTER TABLE public.app_download_links ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to download links
CREATE POLICY "Download links are publicly readable" 
  ON public.app_download_links 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow updates (for admin functionality)
CREATE POLICY "Allow updates to download links" 
  ON public.app_download_links 
  FOR UPDATE 
  TO public
  USING (true);
