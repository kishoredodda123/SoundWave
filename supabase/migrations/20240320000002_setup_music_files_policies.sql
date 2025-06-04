-- First, make sure RLS is enabled
ALTER TABLE public.music_files ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Enable all operations for anon and authenticated users" ON public.music_files;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.music_files;

-- Create a new policy that allows all operations for both anon and authenticated users
CREATE POLICY "Enable all operations for anon and authenticated users"
ON public.music_files
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to anon and authenticated roles
GRANT ALL ON public.music_files TO anon;
GRANT ALL ON public.music_files TO authenticated;

-- Grant usage on the sequence if it exists
GRANT USAGE ON SEQUENCE public.music_files_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.music_files_id_seq TO authenticated; 