
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BACKBLAZE_APP_KEY_ID = "005ef3018aedce30000000002";
const BACKBLAZE_APP_KEY = "K0057ZHWh10HSaUAggG4bKeOtOLJG6E";
const BACKBLAZE_BUCKET_NAME = "Music-web";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

// Cache for authorization token
let authCache: { token: string; apiUrl: string; downloadUrl: string; expires: number } | null = null;

async function getAuthToken() {
  // Check if we have a valid cached token (valid for 24 hours)
  if (authCache && authCache.expires > Date.now()) {
    return authCache;
  }

  const authUrl = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
  const credentials = btoa(`${BACKBLAZE_APP_KEY_ID}:${BACKBLAZE_APP_KEY}`);
  
  const response = await fetch(authUrl, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to authorize with Backblaze: ${response.status}`);
  }
  
  const authData = await response.json();
  
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
    const auth = await getAuthToken();
    const encodedFileName = encodeURIComponent(fileName);
    const fileUrl = `${auth.downloadUrl}/file/${BACKBLAZE_BUCKET_NAME}/${encodedFileName}`;
    
    console.log(`Streaming file: ${fileName} from ${fileUrl}`);
    
    const headers: Record<string, string> = {
      Authorization: auth.token,
    };
    
    // Add range header for partial content requests (important for audio streaming)
    if (range) {
      headers.Range = range;
    }
    
    const response = await fetch(fileUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    // Get the response headers
    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const contentLength = response.headers.get("content-length");
    const acceptRanges = response.headers.get("accept-ranges");
    const contentRange = response.headers.get("content-range");
    
    // Prepare response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    };
    
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }
    
    if (acceptRanges) {
      responseHeaders["Accept-Ranges"] = acceptRanges;
    }
    
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }
    
    // Return the appropriate status code
    const status = range && response.status === 206 ? 206 : 200;
    
    return new Response(response.body, {
      status,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error("Error streaming audio file:", error);
    return new Response(JSON.stringify({ error: "Failed to stream audio file" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(async (req) => {
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
