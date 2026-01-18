import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';

const frontendDir = path.resolve(__dirname, '../frontend');
const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
} as Record<string, string>;

export default function useStatic(req: IncomingMessage, res: ServerResponse) {
    if (req.url == '/') {
        const indexPath = path.join(frontendDir, 'index.html');
        const indexContent = fs.readFileSync(indexPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexContent);
    } else if (req.url && req.url.startsWith('/assets/')) {
        // 提供前端静态资源服务
        const assetPath = path.join(frontendDir, req.url);
        if (fs.existsSync(assetPath)) {
            const ext = path.extname(assetPath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';
            const assetContent = fs.readFileSync(assetPath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(assetContent);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(JSON.stringify({ error: 'asset not found' }));
        }
    }
}