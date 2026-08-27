const http = require('node:http');
const { createReadStream, existsSync, statSync } = require('node:fs');
const { resolve, extname } = require('node:path');

const host = process.env.BETA_PREVIEW_HOST || '127.0.0.1';
const port = Number(process.env.BETA_PREVIEW_PORT || 4173);
const mount = '/CurManLight_arena';
const dist = resolve('dist');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const sendFile = (res, filePath, statusCode = 200) => {
  res.writeHead(statusCode, {
    'content-type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${host}:${port}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === mount || pathname === `${mount}/`) {
    return sendFile(res, resolve(dist, 'index.html'));
  }

  if (pathname.startsWith(`${mount}/`)) {
    const relative = pathname.slice(mount.length + 1);
    const candidate = resolve(dist, relative);
    if (candidate.startsWith(dist) && existsSync(candidate) && statSync(candidate).isFile()) {
      return sendFile(res, candidate);
    }

    // GitHub Pages serves the repository 404 document for a deep SPA route.
    // The Beta package deliberately copies index.html to 404.html so BrowserRouter
    // can rehydrate the requested route while preserving the original pathname.
    return sendFile(res, resolve(dist, '404.html'), 404);
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, host, () => {
  console.log(`BETA_PAGES_PREVIEW_READY http://${host}:${port}${mount}/`);
});

const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
