// Modulo que ira conectar com os dispositivos e coletar/processar dados.
var dgram = require('node:dgram');

function run() {
    const server = dgram.createSocket('udp4');
    const pong = Buffer.from('pong');

    function echo_server_log(msg) {
        console.log("[echo_server] " + msg);
    }

    server.on('error', (err) => {
        echo_server_log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        try {
            echo_server_log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            if (msg == "ping") { 
                echo_server_log("ping received, sending pong back");
                server.send(pong, port=rinfo.port, address=rinfo.address);
            }
        } catch (e) {
            echo_server_log(e);
        }
    });

    server.on('listening', () => {
        const address = server.address();
        echo_server_log(`echo server listening ${address.address}:${address.port}`);
    });

    server.bind(50023);
}

module.exports.run = run;