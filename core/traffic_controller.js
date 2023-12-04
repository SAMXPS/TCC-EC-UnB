function traffic_controller_log(msg) {
    console.log("[traffic_controller] " + msg);
}

function run() {
    const WebSocket = require('ws');

    const server = new WebSocket.Server({
        port: 50024
    });

    let sockets = [];
    
    server.on('connection', function(socket) {
      // Adicionamos cada nova conexão/socket ao array `sockets`
      sockets.push(socket);
      // Quando você receber uma mensagem, enviamos ela para todos os sockets
      socket.on('message', function(msg) {
        traffic_controller_log("received: " + msg);
        sockets.forEach(s => s.send(msg));
      });
      // Quando a conexão de um socket é fechada/disconectada, removemos o socket do array
      socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
      });
    });
    
    server.on('listening', () => {
        const address = server.address();
        traffic_controller_log(`traffic controller listening ${address.address}:${address.port}`);
    });
}

module.exports.run = run;