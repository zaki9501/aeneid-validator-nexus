   // server.js
   const express = require('express');
   const fetch = require('node-fetch');
   const app = express();
   const PORT = 3001;

   // Add CORS headers for all routes
   app.use((req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
     res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
     // Handle preflight requests
     if (req.method === 'OPTIONS') {
       return res.status(204).end();
     }
     next();
   });

   app.get('/api/blocks', async (req, res) => {
     try {
       console.log('Fetching blocks from upstream API...');
       const response = await fetch('https://api-aeneid.storyscan.app/blocks', {
         headers: {
           'Accept': 'application/json',
           'User-Agent': 'Node.js Proxy Server'
         }
       });

       if (!response.ok) {
         console.error('Upstream API error:', response.status, response.statusText);
         return res.status(502).json({ 
           error: 'Failed to fetch blocks',
           status: response.status,
           statusText: response.statusText 
         });
       }

       const data = await response.json();
       console.log('Successfully fetched blocks. Count:', Array.isArray(data) ? data.length : 'N/A');
       res.json(data);
     } catch (error) {
       console.error('Proxy server error:', error);
       res.status(500).json({ 
         error: 'Failed to fetch blocks',
         details: error.message 
       });
     }
   });

   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
   });
