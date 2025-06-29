import requests
from bs4 import BeautifulSoup
import logging
from typing import Optional
from requests.exceptions import RequestException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_new_streaming_url(website_url: str) -> Optional[str]:
    """
    Attempts to get a new streaming URL from the provided website URL.
    
    Args:
        website_url: The URL of the website to scrape
        
    Returns:
        Optional[str]: The new streaming URL if found, None otherwise
        
    Raises:
        ValueError: If the website_url is invalid
        RequestException: If there's an error making the request
    """
    if not website_url or not website_url.startswith(('http://', 'https://')):
        logger.error(f"Invalid website URL: {website_url}")
        raise ValueError("Invalid website URL")

    try:
        logger.info(f"Attempting to fetch URL: {website_url}")
        
        # Add headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(website_url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all download buttons
        download_links = [
            a['href']
            for a in soup.find_all('a', class_='btn btn-success', attrs={'download': True})
            if a.get('href')
        ]
        
        if not download_links:
            logger.warning(f"No download links found at URL: {website_url}")
            # Try alternative selectors
            download_links = [
                a['href']
                for a in soup.find_all('a', attrs={'download': True})
                if a.get('href')
            ]
            
            if not download_links:
                logger.warning("No download links found with alternative selector")
                # Try finding video sources
                video_sources = [
                    source['src']
                    for source in soup.find_all('source')
                    if source.get('src')
                ]
                if video_sources:
                    logger.info("Found video source tags")
                    return video_sources[0]
                
                iframe_sources = [
                    iframe['src']
                    for iframe in soup.find_all('iframe')
                    if iframe.get('src') and ('player' in iframe['src'] or 'embed' in iframe['src'])
                ]
                if iframe_sources:
                    logger.info("Found iframe source")
                    return iframe_sources[0]
                
                logger.error("No video sources found")
                return None
        
        logger.info(f"Found {len(download_links)} download links")
        return download_links[0]
        
    except RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise 