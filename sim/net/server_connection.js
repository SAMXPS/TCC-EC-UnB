function serverConnect() {
    return new Promise((resolve, reject) => {
        const timeout = 200; //ms

        const ws = new WebSocket('ws://localhost:50024');

        ws.onopen = function() {
            resolve(ws);
        };

        const interval = setTimeout(() => {
            reject(new Error("Server connection timed out."));
        }, timeout);
    });
}