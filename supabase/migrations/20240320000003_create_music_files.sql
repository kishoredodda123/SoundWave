-- Drop existing table if it exists
DROP TABLE IF EXISTS public.music_files;

-- Create the music_files table
CREATE TABLE public.music_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT,
    duration INTEGER,
    genre TEXT,
    release_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS first to ensure we can modify it
ALTER TABLE public.music_files DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE public.music_files ENABLE ROW LEVEL SECURITY;

-- Create policy to enable read for all users
CREATE POLICY "Enable read for all users" ON public.music_files
    FOR SELECT USING (true);

-- Create policy to enable insert for all users
CREATE POLICY "Enable insert for all users" ON public.music_files
    FOR INSERT WITH CHECK (true);

-- Create policy to enable update for all users
CREATE POLICY "Enable update for all users" ON public.music_files
    FOR UPDATE USING (true) WITH CHECK (true);

-- Create policy to enable delete for all users
CREATE POLICY "Enable delete for all users" ON public.music_files
    FOR DELETE USING (true);

-- Grant permissions to roles
GRANT ALL ON public.music_files TO postgres;
GRANT ALL ON public.music_files TO anon;
GRANT ALL ON public.music_files TO authenticated;
GRANT ALL ON public.music_files TO service_role;

-- Grant usage on the sequence
GRANT USAGE ON SEQUENCE public.music_files_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.music_files_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.music_files_id_seq TO service_role; 