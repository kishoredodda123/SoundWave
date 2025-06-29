from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from scraper import get_new_streaming_url
from typing import List, Dict, Any
import os
import logging
from requests.exceptions import RequestException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = "https://xfedtaajlodjzwphkenq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZWR0YWFqbG9kanp3cGhrZW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkyNzEzMywiZXhwIjoyMDYzNTAzMTMzfQ.oCgU04dSnJFL07UGl8OmKBLgB3ujeu2fE9tQpMfR1BA"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Successfully initialized Supabase client")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise

@app.post("/api/refresh-link/{media_id}")
async def refresh_link(media_id: str, quality: str | None = None):
    try:
        logger.info(f"Refreshing link for media {media_id}, quality: {quality}")
        
        # Get movie from Supabase
        try:
            response = supabase.table('movies').select('*').eq('id', media_id).execute()
            logger.info(f"Supabase query response: {response}")
        except Exception as e:
            logger.error(f"Supabase query failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        
        if not response.data or len(response.data) == 0:
            logger.error(f"Movie not found: {media_id}")
            raise HTTPException(
                status_code=404,
                detail=f"Media with ID {media_id} not found"
            )
        
        movie = response.data[0]
        logger.info(f"Found movie: {movie['title']}")
        
        # Find the quality to update
        quality_to_update = None
        video_qualities = movie.get('video_qualities', [])
        logger.info(f"Available qualities: {[q['quality'] for q in video_qualities]}")
        
        for q in video_qualities:
            if quality is None or q['quality'] == quality:
                quality_to_update = q
                break
        
        if not quality_to_update:
            logger.error(f"Quality {quality} not found in available qualities")
            raise HTTPException(
                status_code=400,
                detail=f"Quality {quality} not found for media {media_id}. Available qualities: {[q['quality'] for q in video_qualities]}"
            )
        
        website_url = quality_to_update.get('website_url')
        if not website_url:
            logger.error(f"No website_url found for quality: {quality_to_update['quality']}")
            raise HTTPException(
                status_code=400,
                detail=f"No website_url available for quality: {quality_to_update['quality']}"
            )
        
        logger.info(f"Attempting to get new URL from: {website_url}")
        try:
            new_url = get_new_streaming_url(website_url)
        except ValueError as e:
            logger.error(f"Invalid website URL: {website_url}")
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
        except RequestException as e:
            logger.error(f"Failed to fetch website: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"Failed to access source website: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Scraper error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get new URL: {str(e)}"
            )
        
        if not new_url:
            logger.error("No streaming URL found on the website")
            raise HTTPException(
                status_code=404,
                detail="Could not find new streaming URL on the source website"
            )
        
        logger.info(f"Got new URL: {new_url[:50]}...")
        
        # Update the URL for this quality in the video_qualities array
        updated_qualities = [
            {**q, 'url': new_url} if q == quality_to_update else q
            for q in video_qualities
        ]
        
        # Update the movie in Supabase
        try:
            update_response = supabase.table('movies').update({
                'video_qualities': updated_qualities,
                'stream_url': new_url if quality is None or quality == 'Default' else movie['stream_url']
            }).eq('id', media_id).execute()
            
            if not update_response.data:
                logger.error("Failed to update movie data in database")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update movie data in database"
                )
            logger.info("Successfully updated movie data in database")
            
        except Exception as e:
            logger.error(f"Failed to update database: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update database: {str(e)}"
            )
        
        return {
            "new_url": new_url,
            "quality": quality_to_update['quality'],
            "message": f"Successfully refreshed link for {quality_to_update['quality']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 