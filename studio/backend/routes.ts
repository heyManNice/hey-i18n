import { IncomingMessage, ServerResponse } from 'http';
import rpc from './rpc.js';

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>

const routes: Record<string, RouteHandler> = {
    "post:/rpc": rpc,
};

export default routes;