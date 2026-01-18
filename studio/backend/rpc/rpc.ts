import { IncomingMessage, ServerResponse } from 'http'
import backend from './rpc-expose.js';

export default async function rpc(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', async () => {
        try {
            const { funcs, args } = JSON.parse(body);
            let target: any = backend;

            for (const f of funcs.slice(0, -1)) {
                target = target[f];
                if (target === undefined) {
                    throw new Error(`${funcs.join('.')} is not defined`);
                }
            }

            const methodName = funcs[funcs.length - 1];
            const method = target[methodName];
            if (typeof method !== "function") {
                throw new Error(`${funcs.join('.')} is not a function`);
            }

            const result = await method.apply(target, args);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ result }));
        } catch (error: any) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
};