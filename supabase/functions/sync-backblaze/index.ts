
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const BACKBLAZE_APP_KEY_ID = Deno.env.get("BACKBLAZE_APP_KEY_ID") || "";
const BACKBLAZE_APP_KEY = Deno.env.get("BACKBLAZE_APP_KEY") || "";
const BACKBLAZE_BUCKET_ID = Deno.env.get("BACKBLAZE_BUCKET_ID") || "";

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to authorize with Backblaze B2
async function authorizeBackblaze() {
  try {
    const authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    const credentials = btoa(`${BACKBLAZE_APP_KEY_ID}:${BACKBLAZE_APP_KEY}`);
    
    const response = await fetch(authUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to authorize with Backblaze B2: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error authorizing with Backblaze:", error);
    throw error;
  }
}

// Function to list files in a Backblaze B2 bucket
async function listBackblazeFiles(authData: any) {
  try {
    const apiUrl = `${authData.apiUrl}/b2api/v2/b2_list_file_names`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authData.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: BACKBLAZE_BUCKET_ID,
        maxFileCount: 1000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error listing Backblaze files:", error);
    throw error;
  }
}

// Function to process music files and extract metadata
function extractMetadataFromFileName(fileName: string) {
  // In a real implementation, this would parse file names or ID3 tags
  // For now, we'll extract basic info from a filename pattern like "Artist - Title.mp3"
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

// Function to generate a download URL for a Backblaze file
function generateDownloadUrl(authData: any, fileName: string) {
  return `${authData.downloadUrl}/file/${BACKBLAZE_BUCKET_ID}/${encodeURIComponent(fileName)}`;
}

// Main synchronization function
async function syncBackblazeToSupabase() {
  try {
    // Step 1: Authorize with Backblaze
    const authData = await authorizeBackblaze();
    
    // Step 2: List files in the bucket
    const filesData = await listBackblazeFiles(authData);
    
    // Step 3: Process each file
    const syncResults = [];
    
    for (const file of filesData.files) {
      // Only process audio files
      if (!file.fileName.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
        continue;
      }
      
      try {
        // Extract metadata from filename
        const metadata = extractMetadataFromFileName(file.fileName);
        
        // Generate download URL
        const audioUrl = generateDownloadUrl(authData, file.fileName);
        
        // Check if file already exists in database
        const { data: existingFiles } = await supabase
          .from('music_files')
          .select('*')
          .eq('backblaze_file_id', file.fileId);
        
        if (existingFiles && existingFiles.length > 0) {
          // File already exists, update if needed
          continue;
        }
        
        // Insert new file
        const { data, error } = await supabase
          .from('music_files')
          .insert([
            {
              title: metadata.title,
              artist: metadata.artist,
              audio_url: audioUrl,
              backblaze_file_id: file.fileId,
              backblaze_file_name: file.fileName,
              file_size: file.size
            }
          ]);
        
        if (error) {
          throw error;
        }
        
        syncResults.push({
          fileName: file.fileName,
          status: 'added',
          data
        });
      } catch (error) {
        console.error(`Error processing file ${file.fileName}:`, error);
        syncResults.push({
          fileName: file.fileName,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      processed: filesData.files.length,
      results: syncResults
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
  try {
    if (req.method === "POST") {
      // Manual trigger via POST
      const result = await syncBackblazeToSupabase();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } else if (req.method === "GET") {
      // For testing/verification
      return new Response(JSON.stringify({ status: "Backblaze sync function is running" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
