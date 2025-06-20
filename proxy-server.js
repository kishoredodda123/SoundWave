const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
app.use(cors());

app.get('/proxy', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  const protocol = url.startsWith('https') ? https : http;
  
  protocol.get(url, (response) => {
    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/x-matroska');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', response.headers['content-length'] || '');
    
    // Pipe the video stream
    response.pipe(res);
  }).on('error', (err) => {
    console.error('Error fetching video:', err);
    res.status(500).send('Error fetching video');
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 