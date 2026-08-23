import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 8080);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.csv':'text/csv; charset=utf-8', '.json':'application/json; charset=utf-8' };

createServer(async (req,res) => {
  try {
    const path = new URL(req.url, `http://${req.headers.host}`).pathname;
    const relative = path === '/' ? 'index.html' : decodeURIComponent(path.slice(1));
    const file = normalize(join(root, relative));
    if (!file.startsWith(root)) throw new Error('Forbidden');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not found');
    res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream'});
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
}).listen(port, () => console.log(`CleanFlow: http://localhost:${port}`));