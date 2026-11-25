// Proxy tipis: browser -> server ini -> catbox.moe
// (Catbox tidak mengizinkan upload langsung dari browser karena CORS)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MAX_BYTES = 200 * 1024 * 1024; // batas Catbox: 200 MB per file
const html = fs.readFileSync(path.join(__dirname, 'index.html'));

http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  if (req.method === 'POST' && req.url === '/upload') {
    const len = Number(req.headers['content-length'] || 0);
    if (!len || len > MAX_BYTES + 1024 * 1024) {
      res.writeHead(413, { 'Content-Type': 'text/plain' });
      return res.end('File terlalu besar (maks 200 MB) atau kosong.');
    }
    try {
      const r = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        headers: {
          'content-type': req.headers['content-type'],
          'content-length': String(len),
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
        body: req,
        duplex: 'half',
      });
      const text = (await r.text()).trim();
      res.writeHead(r.ok ? 200 : 502, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(text);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      return res.end('Gagal menghubungi Catbox: ' + e.message);
    }
  }

  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => console.log('Jalan di http://localhost:' + PORT));
