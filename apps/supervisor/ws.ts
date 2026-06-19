import WebSocket from "ws";
import {IncomingMessageSchema} from "@repo/validators";


type WSClientOptions = {
    url : string;
    onMessage : (msg : unknown) => void;
}

export function createWSClient(options : WSClientOptions) {
    let ws :WebSocket | undefined;

    let reconnectAttempts = 0;
    let manullyClosed = false;

    function connect() {
        manullyClosed = false;

        ws = new WebSocket(options.url);

        ws.on("open" , () => {
            console.log("conected");
            reconnectAttempts = 0; 
            
        });

        ws.on("message" , (raw) => {
            try {
                const json = JSON.parse(raw.toString());
    
                const result = IncomingMessageSchema.safeParse(json);
    
                if(!result.success) {
                    console.warn("invalid websocket messag", result.error);
                    return ;
                }
    
                options.onMessage(result.data);
            } catch (err) {
                console.error("bad request" , err);
            }

        });

        ws.on("close" , () => {
            if(!manullyClosed) {
                scheduleReconnect();
            }
        });

        ws.on("error" , (err) => {
            console.log("ws error" , err)
        });
    }

    function send(data : any) {
        if(ws?.readyState !== WebSocket.OPEN) return ;

        ws.send(JSON.stringify(data));
    }

    function close() {
      manullyClosed = true;
      ws?.close();
    }

    function scheduleReconnect() {
        reconnectAttempts++;

        const exponential = Math.min(
            1000 * Math.pow(2 , reconnectAttempts),
            3000
        )

        const jitter = Math.floor(Math.random() * 1000);

        const delay = exponential + jitter;


        console.log(`reconnecting in ${delay}ms`);


        setTimeout(() => {
            connect();
        }, delay);
    }

    return {
        connect, 
        send, 
        close,
    }
}


// import {createWSClient} from "./ws";

// const client = createWSClient({
//     url : "ws://localhost:3000",
//     onMessage : (msg) => {
//         console.log("received" , msg)
//     }
// })

// client.connect();

// client.send({
//     type : "ping"
// });