const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || process.argv[2] || 3000);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500'
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || (!origin && req.socket.localAddress === req.socket.remoteAddress);
  res.setHeader('Access-Control-Allow-Origin', isAllowed && origin ? origin : 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Save Endpoint
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const jsonPath = path.join(PUBLIC_DIR, 'data.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved to data.json successfully!' }));
      } catch (err) {
        console.error("Save error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Admin entry hint endpoint.
  // Admin mode is protected client-side by a local 4-digit PIN.
  // This endpoint must not expose secrets.
  if (req.method === 'GET' && req.url === '/admin-token') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: "Admin mode uses a local 4-digit PIN.",
      url: `http://localhost:${PORT}/index.html?admin=1`
    }));
    return;
  }

  // Safe file serving
  const rawPath = req.url.split('?')[0].split('#')[0]; // strip query and fragment

  // The exported school portfolio in DRAFT/ has spaces in almost every filename,
  // so request paths arrive percent-encoded and must be decoded before lookup.
  let urlPath;
  try {
    urlPath = decodeURIComponent(rawPath);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  const filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);

  // Checked after decoding, so encoded traversal (%2e%2e%2f) is caught too. The
  // trailing separator stops a sibling directory sharing the prefix from passing.
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback: deep links into the React school portfolio (BrowserRouter
      // routes like /School_E-Portfolio/dist/cca) resolve to its entry file so
      // the client-side router can take over.
      if (urlPath.startsWith('/School_E-Portfolio/dist/')) {
        const spaEntry = path.join(PUBLIC_DIR, 'School_E-Portfolio', 'dist', 'index.html');
        fs.stat(spaEntry, (entryErr, entryStats) => {
          if (entryErr || !entryStats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
          fs.createReadStream(spaEntry).pipe(res);
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // no-cache forces revalidation so edited script.js/data.json never go stale in
    // an open tab (the server previously sent no caching headers at all).
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`EAE Portfolio server is running at http://localhost:${PORT}`);
});
