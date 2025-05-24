
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Use the updated Backblaze credentials from Supabase secrets
const BACKBLAZE_APP_KEY_ID = "005ef3018aedce30000000002";
const BACKBLAZE_APP_KEY = "K0057ZHWh10HSaUAggG4bKeOtOLJG6E";
const BACKBLAZE_BUCKET_ID = "0edfd3f0f1b8fa7e9d6c0e13";
const BACKBLAZE_BUCKET_NAME = "Music-web";

// Define CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to authorize with Backblaze B2
async function authorizeBackblaze() {
  try {
    const authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    const credentials = btoa(`${BACKBLAZE_APP_KEY_ID}:${BACKBLAZE_APP_KEY}`);
    
    console.log("Authorizing with Backblaze B2...");
    console.log("Using App Key ID:", BACKBLAZE_APP_KEY_ID);
    
    const response = await fetch(authUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Authorization failed with status:", response.status);
      console.error("Error response:", errorText);
      throw new Error(`Failed to authorize with Backblaze B2: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const authData = await response.json();
    console.log("Authorization successful");
    console.log("API URL:", authData.apiUrl);
    console.log("Download URL:", authData.downloadUrl);
    return authData;
  } catch (error) {
    console.error("Error authorizing with Backblaze:", error);
    throw error;
  }
}

// Function to list files in a Backblaze B2 bucket
async function listBackblazeFiles(authData) {
  try {
    const apiUrl = `${authData.apiUrl}/b2api/v2/b2_list_file_names`;
    
    console.log(`Listing files in bucket ${BACKBLAZE_BUCKET_NAME} (${BACKBLAZE_BUCKET_ID})...`);
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
      const errorText = await response.text();
      console.error("List files failed with status:", response.status);
      console.error("Error response:", errorText);
      throw new Error(`Failed to list files: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.files.length} files in bucket`);
    return data;
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

// Function to generate a download URL for a Backblaze file
function generateDownloadUrl(authData, fileName) {
  if (!authData || !authData.downloadUrl) {
    throw new Error("Authorization data is missing downloadUrl");
  }
  
  const encodedFileName = encodeURIComponent(fileName);
  return `${authData.downloadUrl}/file/${BACKBLAZE_BUCKET_NAME}/${encodedFileName}`;
}

// Main synchronization function
async function syncBackblazeToSupabase() {
  try {
    console.log("Starting synchronization process...");
    
    // Step 1: Authorize with Backblaze
    const authData = await authorizeBackblaze();
    
    // Step 2: List files in the bucket
    const filesData = await listBackblazeFiles(authData);
    
    // Step 3: Process each file
    const syncResults = {
      processed: filesData.files.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    for (const file of filesData.files) {
      // Only process audio files
      if (!file.fileName.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
        syncResults.skipped++;
        syncResults.details.push({
          fileName: file.fileName,
          status: 'skipped',
          reason: 'Not an audio file'
        });
        continue;
      }
      
      try {
        console.log(`Processing file: ${file.fileName}`);
        
        // Extract metadata from filename
        const metadata = extractMetadataFromFileName(file.fileName);
        
        // Generate download URL
        const audioUrl = generateDownloadUrl(authData, file.fileName);
        
        // Check if file already exists in database
        const { data: existingFiles, error: selectError } = await supabase
          .from('music_files')
          .select('*')
          .eq('backblaze_file_id', file.fileId);
        
        if (selectError) {
          throw selectError;
        }
        
        if (existingFiles && existingFiles.length > 0) {
          // File already exists, update if needed
          const { error: updateError } = await supabase
            .from('music_files')
            .update({
              title: metadata.title,
              artist: metadata.artist,
              audio_url: audioUrl,
              backblaze_file_name: file.fileName,
              file_size: file.size,
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
            metadata
          });
          
          console.log(`Updated existing file: ${file.fileName}`);
        } else {
          // Insert new file
          const { error: insertError } = await supabase
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
          
          if (insertError) {
            throw insertError;
          }
          
          syncResults.added++;
          syncResults.details.push({
            fileName: file.fileName,
            status: 'added',
            metadata
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
      // Manual trigger via POST
      console.log("POST request received, starting sync process");
      const result = await syncBackblazeToSupabase();
      
      return new Response(JSON.stringify(result), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      });
    } else if (req.method === "GET") {
      // For testing/verification
      return new Response(JSON.stringify({ 
        status: "Backblaze sync function is running",
        config: {
          backblaze_bucket: BACKBLAZE_BUCKET_NAME,
          backblaze_bucket_id: BACKBLAZE_BUCKET_ID,
          backblaze_app_key_id: BACKBLAZE_APP_KEY_ID
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
