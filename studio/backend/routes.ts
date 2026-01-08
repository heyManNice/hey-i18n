import { IncomingMessage, ServerResponse } from 'http'

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>

const routes: Record<string, RouteHandler> = {
    "get:/": async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('hello 你好，这是根路径')
    }
};

export default routes;