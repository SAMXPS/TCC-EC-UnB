function traffic_controller_log(msg) {
	console.log("[traffic_controller] " + msg);
}

function getMillis() {
    return Date.now();
}

const SIMULATION_TIMEOUT = 15000;

class SimulationHandler {


}

class SocketHandler {
	static sockets     = [];
	static simulations = new Map();

	constructor(socket) {
		this.simulation_id 	= null;
		this.type 			= null;
		this.simulation 	= null;
		this.id             = null;
		this.socket         = socket;

		let handler = this;

		SocketHandler.sockets.push(socket);

		socket.on('message', function (msg) {
			try {
				handler.handleMessage(msg);
			} catch (e) {
				console.log(e);
				socket.close();
			}
		});

		socket.on('close', function () {
			handler.handleClose();
			SocketHandler.sockets = SocketHandler.sockets.filter(s => s !== socket);
		});
	}

	handleClose() {
		if (this.id && this.simulation) {
			if (this.type == 'car') {
				this.simulation.cars.delete(this.id);
			}

			if (this.type == 'crossroad') {
				this.simulation.cross = null;
			}
		}
	}

	handleMessage(msg) {
		//traffic_controller_log("recv: " + msg);

		msg = msg.toString();

		if (this.simulation_id == null) {
			this.simulation_id = msg;

			if (!SocketHandler.simulations.has(this.simulation_id)) {
				console.log("creating simulation with id = " + this.simulation_id);

				this.simulation = {
					id: this.simulation_id,
					lastUpdate: getMillis(),
					cars: new Map(),
					cross: null,
				};

				SocketHandler.simulations.set(this.simulation_id, this.simulation);
				return;
			} 

			this.simulation = SocketHandler.simulations.get(this.simulation_id);
			console.log("loading simulation with id = " + this.simulation.id);
			return;
		} 
		
		if (this.type == null) {
			if (msg == 'car') {
				this.type = 'car';
				this.lastUpdate = 0;
				this.info = null;
			} else if (msg == 'crossroad') {
				this.type = 'crossroad';
				this.simulation.cross = this;
				this.simulation.lastUpdate = getMillis();
			} else {
				traffic_controller_log("wat? " + msg);
				this.socket.close();
			}
			return;
		}

		if (this.id == null) {
			this.id = msg;
			if (this.type == 'car') {
				this.simulation.cars.set(this.id, this);
			}
			this.socket.send("load_ok");
			return;
		}

		switch (this.type) {
			case 'car':
				this.info = JSON.parse(msg);
				this.lastUpdate = getMillis();
				break;
			case 'crossroad':
				this.simulation.lastUpdate = getMillis();
				break;
			default:
				break;
		}
	}
}

function run() {
	const WebSocket = require('ws');

	const server = new WebSocket.Server({
		port: 50024
	});

	setInterval(()=>{
		SocketHandler.simulations.forEach((simulation, id, map)=>{
			if (simulation.lastUpdate + SIMULATION_TIMEOUT < getMillis()) {
				console.log("removing simulation with id = " + id);
				map.delete(id);
				return;
			}
		});
	}, 1000);

	server.on('connection', function (socket) {
		new SocketHandler(socket);
	});

	server.on('listening', () => {
		const address = server.address();
		traffic_controller_log(`traffic controller listening ${address.address}:${address.port}`);
	});
}

module.exports.run = run;