function traffic_controller_log(msg) {
	console.log("[traffic_controller] " + msg);
}

function run() {
	const WebSocket = require('ws');

	const server = new WebSocket.Server({
		port: 50024
	});

	let sockets = [];

	let simulations = [];

	server.on('connection', function (socket) {
		var simulation_id = null;
		var type = null;

		sockets.push(socket);

		socket.on('message', function (msg) {
			traffic_controller_log("recv: " + msg);

			if (simulation_id == null) {
				simulation_id = msg;
			} else if (type == null) {

				if (msg == 'car') {
					type = 'car';
				} else if (msg == 'crossroad') {
					type = 'crossroad';
				} else {
					traffic_controller_log("wat? " + msg);
					socket.close();
				}

				traffic_controller_log("load ok!");
				socket.send("load_ok");
			}
		});

		socket.on('close', function () {
			sockets = sockets.filter(s => s !== socket);
		});
	});

	server.on('listening', () => {
		const address = server.address();
		traffic_controller_log(`traffic controller listening ${address.address}:${address.port}`);
	});
}

module.exports.run = run;