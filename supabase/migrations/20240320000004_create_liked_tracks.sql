-- Drop existing table if it exists
DROP TABLE IF EXISTS public.liked_tracks;

-- Create the liked_tracks table
CREATE TABLE public.liked_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id UUID NOT NULL REFERENCES public.music_files(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX liked_tracks_track_id_idx ON public.liked_tracks(track_id);

-- Enable RLS
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for all users"
    ON public.liked_tracks
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users"
    ON public.liked_tracks
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
    ON public.liked_tracks
    FOR DELETE
    USING (true);

-- Grant permissions
GRANT ALL ON public.liked_tracks TO postgres;
GRANT ALL ON public.liked_tracks TO anon;
GRANT ALL ON public.liked_tracks TO authenticated;
GRANT ALL ON public.liked_tracks TO service_role; 