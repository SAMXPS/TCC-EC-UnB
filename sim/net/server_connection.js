function serverConnect() {
    return new Promise((resolve, reject) => {
        const timeout = 200; //ms

        let resolved = 0;

        const ws = new WebSocket('ws://localhost:50024');

        ws.onopen = function() {
            resolved = 1;
            resolve(ws);
        };

        setTimeout(() => {
            if (!resolved) {
                reject(new Error("Server connection timed out."));
            }
        }, timeout);
    });
}