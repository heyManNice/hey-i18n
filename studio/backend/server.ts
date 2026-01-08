import http, { IncomingMessage, ServerResponse } from 'http';
import routes from './routes.js';
import useStatic from './static.js';
import chalk from "chalk";

import packageJson from '../../package.json' assert { type: "json" };
const { green, blue, bold } = chalk;

function printBoxedMessage(lines: string[]) {
    const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');
    const width = Math.max(...lines.map(line => stripAnsi(line).length));
    const top = `╔${"═".repeat(width + 2)}╗`;
    const bottom = `╚${"═".repeat(width + 2)}╝`;
    const content = lines.map(line => `║ ${line.padEnd(width + (line.length - stripAnsi(line).length))} ║`);
    console.log(top);
    content.forEach(line => console.log(line));
    console.log(bottom);
}

class Server {
    private server = http.createServer(this.requestListener.bind(this));

    constructor(port: number) {
        this.server.listen(port, () => {
            printBoxedMessage([
                `${bold(green('hey-i18n-studio')) + green(' v' + packageJson.version)} ready`,
                ``,
                ` ${green('➜')}  ${bold('Local')}: ${blue(bold(`http://localhost:${port}`))}`,
                ` ${green("➜")}  ${bold("Start")}: ${blue(new Date().toLocaleString())}`,
            ]);
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