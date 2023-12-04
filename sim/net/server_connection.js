function serverConnect() {
    const ws = new WebSocket('ws://localhost:50024');

    ws.onopen = function() {
        ws.send("opa sou um cliente ws");
    };

    ws.onmessage = async function(msg) {
        console.log("received: " + (await msg.data.text()));
    };

    return ws;
}

serverConnect();