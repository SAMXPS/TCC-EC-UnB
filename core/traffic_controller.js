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

class SimulationHandler {

	constructor(id) {
		this.id = id;
		this.lastUpdate = getMillis();
		this.cars = new Map();
		this.cross = null;
		this.enabled = 1;
		this.status = 'loading';

		console.log("creating simulation with id = " + this.simulation_id);

		this.start();
	}

	start() {
		setTimeout(async ()=>{
			while (this.enabled) {				
				if (!this.cross || this.cross?.status != 'autonomous') {
					this.status = 'loading';
				}

				this.cars.forEach((car)=>{
					if (this.status != 'autonomous') {
						car.desiredSpeed = 0;
					} else {
						car.desiredSpeed = 10;
					}

					try {
						car.sendMessage({
							type: 'car_update',
							status: this.status,
							desiredSpeed: car.desiredSpeed
						});
					} catch (e) {

					}
				});

				if (this.cross) {
					let message = {
						type: 'cross_update'
					};

					if (!this.cross.setup) {
						message.status = 'waiting_setup';
					} else if (this.cross.status == 'loading') {
						message.status = 'autonomous';
					} else if (this.cross.status == 'autonomous') {
						this.status = 'autonomous';
						message.status = 'autonomous';
					} else {
						message.status = this.status;
					}

					this.cross.sendMessage(message);
				}

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
					car.position = message.position;
					car.speed = message.speed;
					car.road = message.road;
				}
				break;
			case 'crossroad':
				let cross = from;
				if (message.type == 'cross_setup') {
					cross.entranceGroups = message.entranceGroups;
					cross.setup = true;
				}
				if (message.type == 'cross_status') {
					cross.status = message.status;
					cross.lastUpdate = getMillis();
				}
				break;
		}
	}

    getDistanceTimeTillMaxSpeed(car, maxSpeed) {
        /*if (car.speed < maxSpeed) {
            let speedDiff = maxSpeed - car.speed;
            // Tempo em segundos para atingir velocidade maxima
            let timeTillMaxSpeed = (speedDiff / car.accel);

            let t = timeTillMaxSpeed;
            let v0 = car.speed;
            let a = car.accel;

            let distanceTillMaxSpeed = v0 * t + a * t * t / 2;

            return [timeTillMaxSpeed, distanceTillMaxSpeed];
        }

        return [0, 0];*/
    }

    getMinTimeTillCross(car, maxSpeed) {
        /*
        let distance = car.position.distance(car.crossControl.path.getEnd());
        
        let [timeTillMaxSpeed, distanceTillMaxSpeed] = this.getDistanceTimeTillMaxSpeed(car, maxSpeed);

        if (distance < distanceTillMaxSpeed) {
            let s = distance;
            let a = car.accel;
            let v0 = car.speed;

            // s = v0 t + a t^2 / 2 -> 
            // (a/2) * t^2 + v0 * t - s = 0;
            let A = (a/2);
            let B = v0;
            let C = -s;
            // D = B^2 - 4 * a * c
            let D = B*B - 4 * A * C;

            let t1 = (-B - Math.sqrt(D)) / ( 2 * A )
            let t2 = (-B + Math.sqrt(D)) / ( 2 * A )

            if (t1 > 0 && t1 <= t2) {
                return t1;
            }

            if (t2 > 0 && t2 <= t1) {
                return t2;
            }

            // ????
        }

        let distanceLeft = distance - distanceTillMaxSpeed;

        return timeTillMaxSpeed + (distanceLeft / maxSpeed);*/
    }

    onEnterControl(car) {
        /*car.controlledBy = this;
        car.color = color(128,128,255);
        car.crossControl = {
            path: car.road.crossPath,
            group: car.road.group
        }
        car.crossControl.group.queue.push(car);
        this.controlledCars.push(car);*/
    }

    onExitControl(car) {
        /*let index = this.controlledCars.indexOf(car);
        if (index > -1) {
            this.controlledCars.splice(index, 1);
        }

        index = car.crossControl.group.queue.indexOf(car);
        if (index > -1) {
            car.crossControl.group.queue.splice(index, 1);
        }
        car.controlledBy = null;
        car.color = null;
        delete car.crossControl;
        delete car.desiredSpeed;*/
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
				this.road = null;
				this.desiredSpeed = 0;
			} else if (msg == 'crossroad') {
				this.type = 'crossroad';
				this.setup = 0;
				this.entranceGroups = null;
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