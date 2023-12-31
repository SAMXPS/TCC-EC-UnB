var server_list = require("./server_list").server_list;
var dgram = require('node:dgram');

const ping = Buffer.from('ping');
const conn_timeout = 1000;

async function ping_server(address, port=50023) {
    return await new Promise((resolve, reject) => {
        try {
            const pinger = dgram.createSocket('udp4');
            var send_time, recv_time; 

            pinger.on('connect', ()=>{
                send_time = process.hrtime.bigint();
                pinger.send(ping);
            });

            pinger.on('error', (err)=>{
                reject(err);
            });

            pinger.on('message', (msg, rinfo) => {
                console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
                if (msg == 'pong') {
                    recv_time = process.hrtime.bigint();
                    var latency = recv_time - send_time;
                    resolve(Math.floor(Number((latency))/10000)/100); // resolucao em 0.01ms
                }
            });

            pinger.connect(port=port,address=address);

            setTimeout(() => {
                reject(new Error('connection timed out'));
            }, conn_timeout);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    find_best_server: async () => {
        running = [];
        server_list.forEach((server_address) => {
            console.log("lets ping " + server_address);
            running.push(new Promise(async (resolve, reject) => {
                try { 
                    resolve({address:server_address, success: true, error: null, latency:await ping_server(server_address)});
                } catch (e) {
                    resolve({address:server_address, success: false, error: e.toString()});
                }
            }));
        });

        const results = await Promise.all(running);
        var best_server = null;
        var online_servers = 0;

        results.forEach((result)=>{
            if (result.success) {
                online_servers++;
                if (!best_server || result.latency < best_server.latency) {
                    best_server = result;
                }
            } else {
                console.log("Error while pinging server " + result.address + ": " + result.error);
            }
        });
    
        if (best_server) {
            return {
                best_server: best_server.address,
                latency: best_server.latency,
                online_servers: online_servers,
                ping_results: results,
            };
        }

        return {
            best_server: null,
            latency: null,
            online_servers: online_servers,
            ping_results: results,
        };
    },
}

module.exports.find_best_server().then((result)=>{
    console.log(result);
});