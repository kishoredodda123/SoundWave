
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { S3Client, ListObjectsV2Command } from "https://esm.sh/@aws-sdk/client-s3@3.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Backblaze B2 S3-compatible configuration
const BACKBLAZE_APP_KEY_ID = "005ef3018aedce30000000002";
const BACKBLAZE_APP_KEY = "K0057ZHWh10HSaUAggG4bKeOtOLJG6E";
const BACKBLAZE_BUCKET_NAME = "Music-web";
const BACKBLAZE_REGION = "us-east-005";
const BACKBLAZE_ENDPOINT = "https://s3.us-east-005.backblazeb2.com";

// Define CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with service role key to bypass RLS
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Create S3 client for Backblaze B2
const s3Client = new S3Client({
  region: BACKBLAZE_REGION,
  endpoint: BACKBLAZE_ENDPOINT,
  credentials: {
    accessKeyId: BACKBLAZE_APP_KEY_ID,
    secretAccessKey: BACKBLAZE_APP_KEY,
  },
  forcePathStyle: true, // Required for Backblaze S3 compatibility
});

// Function to list files in the Backblaze B2 bucket using S3 API
async function listBackblazeFiles() {
  try {
    console.log(`Listing files in bucket ${BACKBLAZE_BUCKET_NAME} using S3 API...`);
    
    const command = new ListObjectsV2Command({
      Bucket: BACKBLAZE_BUCKET_NAME,
      MaxKeys: 1000,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.log("No files found in bucket");
      return { files: [] };
    }
    
    const files = response.Contents.map(object => ({
      fileName: object.Key || '',
      fileId: object.ETag || '',
      size: object.Size || 0,
      lastModified: object.LastModified || new Date(),
    }));
    
    console.log(`Found ${files.length} files in bucket`);
    return { files };
  } catch (error) {
    console.error("Error listing Backblaze files:", error);
    throw error;
  }
}

// Function to process music files and extract metadata
function extractMetadataFromFileName(fileName) {
  try {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    
    // Split by " - " if present
    const parts = nameWithoutExt.split(" - ");
    
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts[1].trim(),
      };
    }
    
    // Default if pattern doesn't match
    return {
      artist: "Unknown Artist",
      title: nameWithoutExt,
    };
  } catch (error) {
    console.error(`Error parsing file name: ${fileName}`, error);
    return {
      artist: "Unknown Artist",
      title: fileName,
    };
  }
}

// Function to check if a file is an audio file
function isAudioFile(fileName) {
  const audioExtensions = [
    '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma', '.opus', '.3gp', '.amr'
  ];
  
  const lowerFileName = fileName.toLowerCase();
  
  // Check for explicit extensions
  const hasAudioExtension = audioExtensions.some(ext => lowerFileName.endsWith(ext));
  
  // Also check for files without extensions that might be audio
  const hasNoExtension = !lowerFileName.includes('.');
  
  return hasAudioExtension || hasNoExtension;
}

// Function to estimate duration for audio files
function estimateAudioDuration(fileName, fileSize) {
  // Basic estimation: assume average bitrate of 128 kbps for MP3
  const averageBitrateKbps = 128;
  const fileSizeInBits = fileSize * 8;
  const durationInSeconds = Math.floor(fileSizeInBits / (averageBitrateKbps * 1000));
  
  // Return a reasonable duration (between 30 seconds and 10 minutes for most songs)
  return Math.max(30, Math.min(durationInSeconds, 600));
}

// Function to generate a download URL for a Backblaze file
function generateDownloadUrl(fileName) {
  const encodedFileName = encodeURIComponent(fileName);
  return `https://f005.backblazeb2.com/file/${BACKBLAZE_BUCKET_NAME}/${encodedFileName}`;
}

// Main synchronization function
async function syncBackblazeToSupabase() {
  try {
    console.log("Starting synchronization process with S3 API...");
    
    // List files in the bucket using S3 API
    const filesData = await listBackblazeFiles();
    
    // Process each file
    const syncResults = {
      processed: filesData.files.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    for (const file of filesData.files) {
      try {
        console.log(`Processing file: ${file.fileName}`);
        
        // Check if it's an audio file
        if (!isAudioFile(file.fileName)) {
          syncResults.skipped++;
          syncResults.details.push({
            fileName: file.fileName,
            status: 'skipped',
            reason: 'Not recognized as an audio file'
          });
          console.log(`Skipped ${file.fileName}: Not recognized as audio file`);
          continue;
        }
        
        // Extract metadata from filename
        const metadata = extractMetadataFromFileName(file.fileName);
        
        // Generate download URL
        const audioUrl = generateDownloadUrl(file.fileName);
        
        // Estimate duration based on file size
        const estimatedDuration = estimateAudioDuration(file.fileName, file.size || 0);
        
        console.log(`Audio URL: ${audioUrl}`);
        console.log(`Estimated duration: ${estimatedDuration} seconds`);
        
        // Check if file already exists in database
        const { data: existingFiles, error: selectError } = await supabaseService
          .from('music_files')
          .select('*')
          .eq('backblaze_file_id', file.fileId);
        
        if (selectError) {
          throw selectError;
        }
        
        if (existingFiles && existingFiles.length > 0) {
          // File already exists, update if needed
          const { error: updateError } = await supabaseService
            .from('music_files')
            .update({
              title: metadata.title,
              artist: metadata.artist,
              audio_url: audioUrl,
              backblaze_file_name: file.fileName,
              file_size: file.size,
              duration: estimatedDuration,
              updated_at: new Date().toISOString()
            })
            .eq('backblaze_file_id', file.fileId);
            
          if (updateError) {
            throw updateError;
          }
          
          syncResults.updated++;
          syncResults.details.push({
            fileName: file.fileName,
            status: 'updated',
            metadata,
            audioUrl,
            duration: estimatedDuration
          });
          
          console.log(`Updated existing file: ${file.fileName}`);
        } else {
          // Insert new file
          const { error: insertError } = await supabaseService
            .from('music_files')
            .insert([
              {
                title: metadata.title,
                artist: metadata.artist,
                audio_url: audioUrl,
                backblaze_file_id: file.fileId,
                backblaze_file_name: file.fileName,
                file_size: file.size,
                duration: estimatedDuration,
                album: 'Unknown Album',
                genre: 'Unknown',
                cover_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300'
              }
            ]);
          
          if (insertError) {
            throw insertError;
          }
          
          syncResults.added++;
          syncResults.details.push({
            fileName: file.fileName,
            status: 'added',
            metadata,
            audioUrl,
            duration: estimatedDuration
          });
          
          console.log(`Added new file: ${file.fileName}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.fileName}:`, error);
        syncResults.errors++;
        syncResults.details.push({
          fileName: file.fileName,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log("Synchronization completed successfully");
    console.log(`Processed: ${syncResults.processed}, Added: ${syncResults.added}, Updated: ${syncResults.updated}, Skipped: ${syncResults.skipped}, Errors: ${syncResults.errors}`);
    
    return {
      success: true,
      ...syncResults
    };
  } catch (error) {
    console.error("Error in syncBackblazeToSupabase:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    if (req.method === "POST") {
      console.log("POST request received, starting sync process with S3 API");
      const result = await syncBackblazeToSupabase();
      
      return new Response(JSON.stringify(result), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      });
    } else if (req.method === "GET") {
      return new Response(JSON.stringify({ 
        status: "Backblaze sync function is running with S3 API",
        config: {
          backblaze_bucket: BACKBLAZE_BUCKET_NAME,
          backblaze_endpoint: BACKBLAZE_ENDPOINT,
          backblaze_region: BACKBLAZE_REGION
        }
      }), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 405,
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      },
      status: 500,
    });
  }
});
