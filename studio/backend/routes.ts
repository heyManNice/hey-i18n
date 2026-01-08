import { IncomingMessage, ServerResponse } from 'http'

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>

const routes: Record<string, RouteHandler> = {
    "post:/functions": async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ message: "function executed successfully." }))
    }
};

export default routes;