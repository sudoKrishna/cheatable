import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";

import {WebSocket} from "ws";

type LogMessage = {
    type : "log";
    stream : "stdout" | "stderr";
    message : string;
}

export function startLogStreamer(
    command : string,
    args :string[],
    ws : WebSocket
) {
    const process : ChildProcessWithoutNullStreams = spawn(command , args, {
        stdio : "pipe",
        shell : true,
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    const queue: LogMessage[] = [];
    const MAX_QUEUE = 1000;

    function handleChunk(chunk : string, stream: "stdout" | "stderr") {
        const buffer = stream === "stdout" ? stdoutBuffer : stderrBuffer;

        const combined = buffer + chunk;
        const lines = combined.split("\n");

        const newBuffer = lines.pop() ?? "";

        if(stream === "stdout")  stdoutBuffer = newBuffer;
        else stderrBuffer = newBuffer;

        for(const line of lines) {
            enqueue({
                type : "log",
                stream,
                message : line,
            });
        }
    }

    function enqueue(msg : LogMessage) {
        if(queue.length >= MAX_QUEUE) {
            queue.shift();
        }
        queue.push(msg);
    }

    function flush() {
        if(ws.readyState !== WebSocket.OPEN) return ;
        if(queue.length === 0) return ;

        const batch = queue.splice(0, 100);

        ws.send(JSON.stringify({
            type : "log_batch",
            logs : batch,
        })
    );
    }

    process.stdout.on("data" , (chunk) => {
        handleChunk(chunk.toString() , "stderr");
    });

    process.on("close", (code) => {
        enqueue({
            type : "log",
            stream : "stdout",
            message : `Process exited  with code ${code}`,
        });
    });

    const interval = setInterval(flush , 100);

    return {
        stop() {
            clearInterval(interval);
            process.kill();
        }
    }
}
// import WebSocket from "ws";
// import { startLogStreamer } from "./logs";

// const ws = new WebSocket("ws://localhost:3000");

// ws.on("open", () => {
//   const logger = startLogStreamer("npm", ["run", "dev"], ws);

//   // later
//   // logger.stop();
// });

