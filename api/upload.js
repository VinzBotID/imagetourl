// Vercel serverless function: meneruskan upload ke Catbox
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Gunakan POST');
  }
  try {
    const len = req.headers['content-length'];
    const r = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
        ...(len ? { 'content-length': len } : {}),
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      body: req,
      duplex: 'half',
    });
    const text = (await r.text()).trim();
    res.statusCode = r.ok ? 200 : 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(text);
  } catch (e) {
    res.statusCode = 502;
    res.end('Gagal menghubungi Catbox: ' + e.message);
  }
};
module.exports.config = { api: { bodyParser: false }, maxDuration: 60 };
