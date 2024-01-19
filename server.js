const express = require('express');
const fetch = require('node-fetch');
const { parseString } = require('xml2js');

const app = express();

app.use((req, res, next) => {
  const allowedOrigins = ['https://edotech.vercel.app', 'http://localhost:3000']; // Add your frontend URL(s)
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.get('/substack-feed', async (req, res) => {
  try {
    const response = await fetch('https://techinedo.substack.com/feed');
    const data = await response.text();

    // Parse XML
    parseString(data, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Assuming RSS structure, adjust as needed
      const items = result.rss.channel[0].item.map(item => ({
        title: item.title[0],
        link: item.link[0],
        image: item['media:content'] ? item['media:content'][0].$.url : null,
        description: item.description ? item.description[0] : null,
      }));

      res.json({ items });
    });
  } catch (error) {
    console.error('Error fetching/parsing Substack feed:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3001;
const HOST = 'https://etc-blog.vercel.app'; // Remove the 'https://' prefix
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
