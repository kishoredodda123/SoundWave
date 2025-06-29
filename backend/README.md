# Python Backend for Streaming Link Refresh

This backend provides an API to refresh expired streaming links by scraping the source website for new download links.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

3. **API Usage:**
   - POST `/api/refresh-link/{media_id}`
     - Looks up the media item by `id` in `media.json`.
     - Scrapes the `website_url` for a new download link.
     - Updates the `url` in `media.json` and returns the new link.

## Files
- `main.py`: FastAPI app and API endpoint
- `scraper.py`: Scraping logic for extracting download links
- `media.json`: Media database (edit as needed)
- `requirements.txt`: Python dependencies

## Customization
- Adjust the scraping logic in `scraper.py` if your source website changes its structure. 