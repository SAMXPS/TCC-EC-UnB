var fs = require('fs');
eval(fs.readFileSync('../sim/utils.js')+'');

function traffic_controller_log(msg) {
	console.log("[traffic_controller] " + msg);
}

/*function getMillis() {
    return Date.now();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}*/
''
const SIMULATION_TIMEOUT  = 15000;
const SIMULATION_TICK_PERIOD = 25;
const CROSS_MAX_LATENCY = 4 * SIMULATION_TICK_PERIOD;

const CAR_MAX_SPEED  = kmh_dms(60);
const CAR_TURN_SPEED = kmh_dms(40);
const CAR_ACCEL      = 25; // 2.5 m/s^2
const CAR_BRAKE      = 70; // 7.0 m/s^2
const CAR_LENGHT     = 35;

class SimulationHandler {

	constructor(id) {
		this.id = id;
		this.lastUpdate = getMillis();
		this.cars = new Map();
		this.cross = null;
		this.enabled = 1;
		this.status = 'loading';

		console.log("creating simulation with id = " + this.id);

		this.start();
	}

	start() {
		setTimeout(async ()=>{
			while (this.enabled) {
				this.updateCross();
				this.controlCars();
				this.updateCars();
				this.lastUpdate = getMillis();
				await sleep(SIMULATION_TICK_PERIOD);
			}
		});

		
        /*

        let lastTime = null;
        let minInterval = 0; // um segundo
        const minDistance = this.width * 4;

        let lastCar = null;

        let myCars = this.controlledCars;

        myCars.forEach((car) => {
            car.crossControl.minTimeTillCross = this.getMinTimeTillCross(car, car.maxSpeed);
            car.crossControl.distanceTillCrossStart = car.crossControl.path.getStart().distance(car.position);
            car.crossControl.distanceTillCrossEnd = car.crossControl.path.getEnd().distance(car.position);
        })

        if (this.time > this.nextSort) {

            // TODO: later if we have time
            // colocar junto carros que estao em pistas opostas pra cruzar juntos sempre que possivel
            // maximizar fluxo de veículos no cruzamento

            this.nextSort = this.time + 100;
        }

        this.entranceGroups.forEach((group)=>{
            group.maxSpeed = kmh_dms(60);
        });


        let index = 0;
        
        myCars.forEach((car) => {
            index++;

            let group = car.crossControl.group;

            car.crossControl.index = index-1;

            if (!lastTime) {
                car.desiredSpeed = car.maxSpeed;
                lastTime = car.crossControl.minTimeTillCross;
                car.crossControl.timeTillCross = lastTime;
                group.maxSpeed = car.maxSpeed;
                lastCar = car;
                return;
            }

            if (car.maxSpeed < group.maxSpeed) {
                group.maxSpeed = car.maxSpeed;
            }
            
            let distanceTillCrossStart = car.crossControl.distanceTillCrossStart;

            // equacao de torricelli
            let maxSpeedAtCross = Math.sqrt( car.speed * car.speed + 2 * car.accel * distanceTillCrossStart );

            let currentTime = this.getMinTimeTillCross(car, group.maxSpeed);

            if (!car.road.cross) {
                if (car.crossControl.group != lastCar.crossControl.group) {
                    minInterval = minDistance / Math.min(group.maxSpeed, maxSpeedAtCross);
        
                    while (currentTime - lastTime < minInterval && group.maxSpeed > kmh_dms(5)) {
                        group.maxSpeed -= 1;
                        currentTime = this.getMinTimeTillCross(car, group.maxSpeed);
                        minInterval = minDistance / Math.min(group.maxSpeed, maxSpeedAtCross);
                    }
                }
            }

            car.desiredSpeed = group.maxSpeed;

            if (currentTime > lastTime) {
                lastTime = currentTime;
            }

            car.crossControl.timeTillCross = lastTime;
            lastCar = car;
        });

        // Detect cars entering the crossRoad
        simulation.cars.forEach((car) => {
            if (car.isNearCross(this)) {
                if (car.controlledBy != this) {
                    this.onEnterControl(car);
                }
            } else if (car.road.cross == this) {

            } else if (car.controlledBy == this) {
                this.onExitControl(car);
            }
        });
        */

	}

	handleMessage(from, message) {
		switch(from.type) {
			case 'car':
				let car = from;
				if (message.type == 'position_update') {
					car.lastUpdate = getMillis();
					car.position = parseAllignedPosition(message.position);
					car.speed = message.speed;
					car.road = this.roads?.get(message.road);
				}
				break;
			case 'crossroad':
				let cross = from;
				if (message.type == 'cross_setup') {
					let plainGroups = message.entranceGroups;
					let roads = new Map();
					let groups = [];
					let gid = 0;

					plainGroups.forEach((plainGroup)=>{
						let group = {
							paths: [],
							id: gid++,
						};

						plainGroup.forEach((plain) => {
							let path = plain.path;
							path.type = 'path';
							path.end = parseAllignedPosition(path.end);

								let entrance = plain.entrance;
								entrance.type = 'entrance';
								entrance.end = parseAllignedPosition(entrance.end);
								entrance.path = path;
								roads.set(entrance.id, entrance);

								let exit = plain.exit;
								exit.type = 'exit';
								exit.path = path;
								roads.set(exit.id, exit);

							path.start = entrance.end.copy();
							path.center = path.end.average(entrance.end);
							path.exit = exit;
							path.entrance = entrance;
							path.queue = [];
							path.path = path;
							path.group = group;
							roads.set(path.id, path);

							group.paths.push(path);
						});

						groups.push(group);
					});

					this.roads  = roads;
					this.groups = groups;
					cross.setup = true;
				}
				if (message.type == 'cross_status') {
					cross.status = message.status;
					cross.lastUpdate = getMillis();
				}
				break;
		}
	}

	autoControl(car) {	
		if (!car.road || car.road.type == 'exit') {
			car.desiredSpeed = CAR_MAX_SPEED;
			car.passCurrentSemaphore = false;
			if (car.crossControl) {
				this.exitCross(car);
			}
			car.cooldown = 0;
			return;
		}	

		if (car.cooldown) {
			car.desiredSpeed = CAR_MAX_SPEED;
			return;
		}

		if (car.road.type == 'path' && !car.crossControl) {
			return;
		}

		if (!car.crossControl) {
			let path = car.road.path;
			let queue = path.queue;

			car.crossControl = path;
			car.passCurrentSemaphore = false;
			car.desiredSpeed = CAR_MAX_SPEED / 2;
			car.queueEnterTime = getMillis();

			queue.push(car);
		}

		let path = car.crossControl.path;

		car.innerIndex = path.queue.indexOf(car);
		car.minTimeToPass = getMinTimeTillLocation(car, CAR_MAX_SPEED, car.road.path.end);
		car.distanceToPass = car.position.distance(car.road.path.end);
		car.distanceToCenter = car.position.distance(car.road.path.center);
		car.distanceToStart = car.position.distance(car.road.path.start);
		car.maxSpeedAtCenter = Math.sqrt( car.speed * car.speed + 2 * car.accel * car.distanceToCenter );

		if (car.distanceToPass < car.distanceToStart && car.speed >= CAR_MAX_SPEED / 2) {
			this.exitCross(car);
		}
	}

	exitCross(car) {
		car.cooldown = 1;
		let path = car.crossControl;
		let queue = path.queue;
		path.queue = queue.filter(c => c.id != car.id);
		car.crossControl = null;
		this.lastGroupToPass = path.group;
	}

	controlCars() {
		if (this.status != 'colony') {
			this.cars.forEach((car)=>{
				car.desiredSpeed = CAR_MAX_SPEED / 2;
				car.passCurrentSemaphore = false;
			});
			return;
		}

		this.cars.forEach((car)=>{
			this.autoControl(car);
		});

		if (!this.lastGroupToPass) {
			this.lastGroupToPass = this.groups[0];
		}

		let cars = [];

		this.groups.forEach((group) => {
			group.firsts = [];
			group.length = 0;
			group.authorizedToPass = 0;

			group.paths.forEach((path)=>{
				group.length += path.queue.length;
				if (path.queue.length > 0) {
					path.queue.sort((carA,carB)=>{
						return carA.distanceToPass - carB.distanceToPass;
					});
					group.firsts.push(path.queue[0]);
				}

				path.queue.forEach((car) => {
					if (car.passCurrentSemaphore) {
						group.authorizedToPass++;
					}

					cars.push(car);
				});
			});

			group.firsts.sort((carA,carB) => {
				return carA.minTimeToPass - carB.minTimeToPass;
			});
		});

		const BIAS = 0;

		cars = cars.sort((carA,carB)=>{
			return carA.queueEnterTime - carB.queueEnterTime;
		});

		let toPass = cars[0]?.crossControl.group;
		let other  = null;

		if (!toPass) {
			return;
		}

		this.groups.forEach((group) => {
			if (group != toPass) {
				other = group;
			}
		});

		if (toPass) {
			if (!other || !other.authorizedToPass) {
				let first = toPass.firsts[0];
				let second = toPass.firsts[1];
				if (first) {
					first.passCurrentSemaphore = 1;
					if (second) {
						let otherFirst = other?.firsts[0];
						if (!otherFirst || (otherFirst?.minTimeToPass + BIAS > second.minTimeToPass)) {
							second.passCurrentSemaphore = 1;
						}
					}
				}
			}
		}

		let maxSpeed = CAR_MAX_SPEED;
		let minTimeToPass = 0;
		const minDistance = CAR_LENGHT * 4;

		cars.forEach((car) => {
			let path = car.crossControl;

			if (car.passCurrentSemaphore) {
				car.desiredSpeed = CAR_MAX_SPEED;
				minTimeToPass = Math.max(minTimeToPass, car.minTimeToPass);
				return;
			}

			car.minTimeToPass = getMinTimeTillLocation(car, maxSpeed, path.end);

			let minInterval = minDistance / Math.min(maxSpeed, car.maxSpeedAtCenter);

			while (car.minTimeToPass - minTimeToPass < minInterval && maxSpeed > kmh_dms(5)) {
				maxSpeed -= 1;
				car.minTimeToPass = getMinTimeTillLocation(car, maxSpeed, path.end);
				minInterval = minDistance / Math.min(maxSpeed, car.maxSpeedAtCenter);
			}

			minTimeToPass = Math.max(minTimeToPass, car.minTimeToPass);
			car.desiredSpeed = maxSpeed;
		});

		let before = null;
		let minInterval = null;

		cars.forEach((car) => {
			let path = car.crossControl;
			car.minTimeToPass = getMinTimeTillLocation(car, CAR_MAX_SPEED, path.end);
			if (before) {
				if (before.passCurrentSemaphore && (car.minTimeToPass - before.minTimeToPass > minInterval || car.passCurrentSemaphore)) {
					this.exitCross(before);
				}
			}
			minInterval = minDistance / Math.min(maxSpeed, car.maxSpeedAtCenter);
			before = car;
		});

	}

	updateCars() {
		this.cars.forEach((car)=>{
			try {
				car.sendMessage({
					type: 'car_update',
					status: this.status,
					desiredSpeed: car.desiredSpeed,
					passCurrentSemaphore: car.passCurrentSemaphore,
					innerIndex: car.innerIndex,
				});
			} catch (e) {

			}
		});
	}

	updateCross() {
		if (!this.cross || this.cross?.status != 'colony') {
			this.status = 'loading';
		}
		
		if (this.cross) {
			let message = {
				type: 'cross_update'
			};

			if (!this.cross.setup) {
				message.status = 'waiting_setup';
			} else if (this.cross.status == 'loading') {
				message.status = 'colony';
			} else if (this.cross.status == 'colony') {
				this.status = 'colony';
				message.status = 'colony';
			} else {
				message.status = this.status;
			}

			this.cross.sendMessage(message);
		}
	}

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
				this.simulation = new SimulationHandler(this.simulation_id);
				SocketHandler.simulations.set(this.simulation_id, this.simulation);
				return;
			} 

			this.simulation = SocketHandler.simulations.get(this.simulation_id);
			console.log("loading simulation with id = " + this.simulation.id);
			return;
		} 
		
		if (this.type == null) {
			this.lastUpdate = 0;
			if (msg == 'car') {
				this.type = 'car';
				this.position = null;
				this.speed = null;
				this.accel = CAR_ACCEL;
				this.brakeAccel = CAR_BRAKE;
				this.road = null;
				this.desiredSpeed = 0;
				this.passCurrentSemaphore = false;
			} else if (msg == 'crossroad') {
				this.type = 'crossroad';
				this.setup = 0;
				this.groups = null;
				this.simulation.cross = this;
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

		this.simulation.handleMessage(this, JSON.parse(msg));
	}

	sendMessage(obj) {
		this.socket.send(JSON.stringify(obj));
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
				simulation.enabled = 0;
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