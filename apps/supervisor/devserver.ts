import {createServer, type ViteDevServer} from 'vite';
import { EventEmitter } from 'node:events';

let server : ViteDevServer | null = null;
let restartTimer : NodeJS.Timeout | null = null;

export async function startDevServer() {
    if(server) return server;

    server = await createServer({
        mode : "development",
        server : {
            host  : true,
        },
    });

    await server.listen();


    const urls = server.resolvedUrls;

    console.log("[vite] ready")
    console.log("local:" ,urls?.local)
    console.log("network:" , urls?.network)

    return server
}

export async function stopDevServer() {
    if(!server) return ;
    
    await server.close();
    server = null;

   console.log(["vite, stopped"])
}

export async function restartDevServer() {
    console.log(["vite, stopped"])

    await stopDevServer();
    await startDevServer();
}


export function scheduleRestart(delay = 500) {
    if(restartTimer) {
        clearTimeout(restartTimer)
    }

    restartTimer = setTimeout(() => {
        restartTimer = null;

        restartDevServer().catch((err) => {
            console.error("[vite] restart failed" , err)
        })
    }, delay)    
}

export function setupShutdownHandlers() {
    const shutdown = async () => {
        await stopDevServer();
        process.exit(0)
    }

    process.once("SIGINT" , shutdown);
    process.once("SIGTERM" , shutdown);
}


// const vite = await startDevServer();
// console.log("frontendurl:" , vite.resolvedUrls?.local?.[0])

// setupShutdownHandlers();