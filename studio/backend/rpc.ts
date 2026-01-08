import { IncomingMessage, ServerResponse } from 'http'

const backend = {
    test: {
        send: function (name: string) {
            return 'Hello from backend test.a: ' + name;
        }
    }
};


export default async function rpc(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', async () => {
        try {
            const { funcs, args } = JSON.parse(body);
            let func: any = backend;
            for (const f of funcs) {
                func = func[f];
            }
            const result = await func(...args);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ result }));
        } catch (error: any) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
};