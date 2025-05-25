
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BACKBLAZE_APP_KEY_ID = "005ef3018aedce30000000002";
const BACKBLAZE_APP_KEY = "K0057ZHWh10HSaUAggG4bKeOtOLJG6E";
const BACKBLAZE_BUCKET_NAME = "Music-web";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "Accept-Ranges, Content-Range, Content-Length, Content-Type",
};

// Cache for authorization token
let authCache: { token: string; apiUrl: string; downloadUrl: string; expires: number } | null = null;

async function getAuthToken() {
  // Check if we have a valid cached token (valid for 24 hours)
  if (authCache && authCache.expires > Date.now()) {
    console.log("Using cached Backblaze auth token");
    return authCache;
  }

  console.log("Getting new Backblaze auth token");
  const authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
  const credentials = btoa(`${BACKBLAZE_APP_KEY_ID}:${BACKBLAZE_APP_KEY}`);
  
  const response = await fetch(authUrl, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to authorize with Backblaze: ${response.status} ${response.statusText}`);
  }
  
  const authData = await response.json();
  console.log("Backblaze auth successful");
  
  // Cache the token for 23 hours (Backblaze tokens are valid for 24 hours)
  authCache = {
    token: authData.authorizationToken,
    apiUrl: authData.apiUrl,
    downloadUrl: authData.downloadUrl,
    expires: Date.now() + (23 * 60 * 60 * 1000)
  };
  
  return authCache;
}

async function streamAudioFile(fileName: string, range?: string) {
  try {
    console.log(`Starting to stream file: ${fileName}`);
    const auth = await getAuthToken();
    const encodedFileName = encodeURIComponent(fileName);
    const fileUrl = `${auth.downloadUrl}/file/${BACKBLAZE_BUCKET_NAME}/${encodedFileName}`;
    
    console.log(`Fetching from Backblaze URL: ${fileUrl}`);
    
    const headers: Record<string, string> = {
      Authorization: auth.token,
    };
    
    // Add range header for partial content requests (important for audio streaming)
    if (range) {
      headers.Range = range;
      console.log(`Range request: ${range}`);
    }
    
    const response = await fetch(fileUrl, { headers });
    
    if (!response.ok) {
      console.error(`Backblaze fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    console.log(`Backblaze response status: ${response.status}`);
    
    // Get the response headers
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const contentLength = response.headers.get("content-length");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";
    const contentRange = response.headers.get("content-range");
    
    console.log(`Content-Type: ${contentType}, Content-Length: ${contentLength}`);
    
    // Prepare response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Accept-Ranges": acceptRanges,
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    };
    
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }
    
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }
    
    // Return the appropriate status code
    const status = range && response.status === 206 ? 206 : 200;
    console.log(`Streaming response status: ${status}`);
    
    return new Response(response.body, {
      status,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error("Error streaming audio file:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to stream audio file", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }
  
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");
    
    if (!fileName) {
      return new Response(JSON.stringify({ error: "File parameter is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get range header for partial content requests
    const range = req.headers.get("range");
    
    return await streamAudioFile(fileName, range || undefined);
    
  } catch (error) {
    console.error("Error in stream-audio function:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
