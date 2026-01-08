import http, { IncomingMessage, ServerResponse } from 'http';
import routes from './routes.js';
import useStatic from './static.js';

class Server {
    private server = http.createServer(this.requestListener.bind(this));

    constructor(port: number) {
        this.server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    }

    private async requestListener(req: IncomingMessage, res: ServerResponse) {
        // 访问根路径时，返回前端的 index.html
        useStatic(req, res);
        if (res.writableEnded) {
            return;
        }

        const method = req.method?.toLowerCase() || "get";
        const url = req.url || "/";
        const key = `${method}:${url}`;

        const handler = routes[key];
        if (handler) {
            await handler(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: `service not found` }));
        }
    };
}


export default Server;