-- Add video_qualities column to movies table
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS video_qualities JSONB[] DEFAULT '{}';

-- Update existing movies to have a default quality based on their stream_url
UPDATE movies 
SET video_qualities = ARRAY[jsonb_build_object(
  'quality', 'Default',
  'url', stream_url
)]
WHERE video_qualities IS NULL OR video_qualities = '{}';

-- Add a check constraint to ensure video_qualities array elements have the correct structure
ALTER TABLE movies
ADD CONSTRAINT video_qualities_check CHECK (
  video_qualities @> '[]'::jsonb[] AND
  (
    SELECT bool_and(
      jsonb_typeof(quality) = 'object' AND
      quality ? 'quality' AND
      quality ? 'url' AND
      jsonb_typeof(quality->'quality') = 'string' AND
      jsonb_typeof(quality->'url') = 'string'
    )
    FROM jsonb_array_elements(video_qualities::jsonb) quality
  )
); 