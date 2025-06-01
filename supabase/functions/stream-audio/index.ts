
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
let authCache: { 
  authorizationToken: string; 
  apiUrl: string; 
  downloadUrl: string; 
  expires: number 
} | null = null;

async function getB2Auth() {
  // Check if we have a valid cached token (valid for 23 hours)
  if (authCache && authCache.expires > Date.now()) {
    console.log("Using cached B2 auth token");
    return authCache;
  }

  console.log("Getting new B2 auth token using native API");
  const credentials = btoa(`${BACKBLAZE_APP_KEY_ID}:${BACKBLAZE_APP_KEY}`);
  
  const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`B2 auth failed: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`Failed to authorize with B2: ${response.status} ${response.statusText}`);
  }
  
  const authData = await response.json();
  console.log("B2 auth successful");
  
  // Cache the token for 23 hours (B2 tokens are valid for 24 hours)
  authCache = {
    authorizationToken: authData.authorizationToken,
    apiUrl: authData.apiUrl,
    downloadUrl: authData.downloadUrl,
    expires: Date.now() + (23 * 60 * 60 * 1000)
  };
  
  return authCache;
}

async function streamAudioFile(fileName: string, range?: string) {
  try {
    console.log(`Streaming request for file: ${fileName}`);
    const auth = await getB2Auth();
    
    // Clean and encode the filename properly
    const cleanFileName = fileName.trim();
    const encodedFileName = encodeURIComponent(cleanFileName);
    const fileUrl = `${auth.downloadUrl}/file/${BACKBLAZE_BUCKET_NAME}/${encodedFileName}`;
    
    console.log(`Fetching from B2: ${fileUrl}`);
    console.log(`Using auth token: ${auth.authorizationToken.substring(0, 20)}...`);
    
    const headers: Record<string, string> = {
      Authorization: auth.authorizationToken,
      "User-Agent": "Supabase-Edge-Function/1.0",
    };
    
    // Add range header for partial content requests (important for audio streaming)
    if (range) {
      headers.Range = range;
      console.log(`Range request: ${range}`);
    }
    
    console.log('Making request to B2 with headers:', Object.keys(headers));
    const response = await fetch(fileUrl, { 
      headers,
      method: "GET"
    });
    
    console.log(`B2 response status: ${response.status}`);
    console.log(`B2 response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error(`B2 fetch failed: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`Error body: ${errorBody}`);
      
      // If unauthorized, clear the auth cache and try once more
      if (response.status === 401) {
        console.log("401 error, clearing auth cache and retrying...");
        authCache = null;
        const newAuth = await getB2Auth();
        
        const retryResponse = await fetch(fileUrl.replace(auth.downloadUrl, newAuth.downloadUrl), {
          headers: {
            ...headers,
            Authorization: newAuth.authorizationToken,
          },
          method: "GET"
        });
        
        if (!retryResponse.ok) {
          const retryErrorBody = await retryResponse.text();
          console.error(`Retry failed: ${retryResponse.status} ${retryResponse.statusText} - ${retryErrorBody}`);
          throw new Error(`Failed to fetch file after retry: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        
        console.log(`Retry successful: ${retryResponse.status}`);
        return createStreamResponse(retryResponse, range);
      }
      
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    return createStreamResponse(response, range);
    
  } catch (error) {
    console.error("Error streaming audio file:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to stream audio file", 
      details: error.message,
      fileName: fileName 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

function createStreamResponse(response: Response, range?: string) {
  // Get the response headers
  const contentType = response.headers.get("content-type") || "audio/mpeg";
  const contentLength = response.headers.get("content-length");
  const acceptRanges = response.headers.get("accept-ranges") || "bytes";
  const contentRange = response.headers.get("content-range");
  
  console.log(`Streaming audio - Type: ${contentType}, Length: ${contentLength}`);
  
  // Prepare response headers
  const responseHeaders: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": contentType,
    "Accept-Ranges": acceptRanges,
    "Cache-Control": "public, max-age=3600",
  };
  
  if (contentLength) {
    responseHeaders["Content-Length"] = contentLength;
  }
  
  if (contentRange) {
    responseHeaders["Content-Range"] = contentRange;
  }
  
  // Return the appropriate status code
  const status = range && response.status === 206 ? 206 : 200;
  console.log(`Returning response with status: ${status}`);
  
  return new Response(response.body, {
    status,
    headers: responseHeaders,
  });
}

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`${req.method} ${url.pathname}${url.search}`);
  
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
    const fileName = url.searchParams.get("file");
    
    if (!fileName) {
      console.error("No file parameter provided");
      return new Response(JSON.stringify({ error: "File parameter is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`Processing request for file: "${fileName}"`);
    
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
