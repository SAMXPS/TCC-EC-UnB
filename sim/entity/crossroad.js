class CrossRoad {

    constructor(entrances, exits, width) {
        this.type = 'crossroad';

        this.entrances = entrances;
        this.exits = exits;

        this.paths = [];
        this.width = width;

        this.center = new AllignedPosition(0,0,0);
        
        let count = 0;

        this.entrances.forEach( entrance => {
            entrance.next = this;

            this.exits.forEach( exit => {
                if (entrance.crossPath) {
                    return; 
                }

                if (Math.abs(atan2(sin(entrance.getEnd().dir-exit.getStart().dir), cos(entrance.getEnd().dir-exit.getStart().dir))) <= 0.01 /*(Math.PI/2 + 0.01)*/) {
                    exit.before = this;
                    let turn = new Turn(entrance, exit, this.width, '', false);
                    turn.cross = this;
                    turn.enabled = false;
                    this.paths.push(turn);
                    entrance.crossPath = turn;
                }
            });

            this.center.x += entrance.getEnd().x;
            this.center.y += entrance.getEnd().y;
            count += 1;
        });

        this.center.x /= count;
        this.center.y /= count;

        this.entranceGroups = [];

        this.entrances.forEach( entrance => {
            if (entrance.group) return;
            this.entrances.forEach( other => {
                if (other.group) return;
                let angle = Math.abs(atan2(sin(entrance.getEnd().dir-other.getEnd().dir), cos(entrance.getEnd().dir-other.getEnd().dir)));
                if (angle + 0.01 > Math.PI && angle - 0.01 < Math.PI) {
                    let group = {
                        entrances: [entrance,other],
                        queue: []
                    };

                    other.group = group;
                    entrance.group = group;
                    this.entranceGroups.push(group);
                }
            });
        });

        //this.paths[0].enabled = 1;
        this.controlledCars = [];

        this.serverConnected = 1;
        this.nextSort = 0;
        this.thread = null;
        this.time   = 0;
    }

    startThread() {
        this.thread = setTimeout(async ()=>{
            while (1) {
                this.manage();
                await sleep(100);
                this.time += 100;
            }
        });
    }

    async connectToServer() {
        let server = await serverConnect();

        if (server) {

        }
    }

    getDistanceTimeTillMaxSpeed(car, maxSpeed) {
        if (car.speed < maxSpeed) {
            let speedDiff = maxSpeed - car.speed;
            // Tempo em segundos para atingir velocidade maxima
            let timeTillMaxSpeed = (speedDiff / car.accel);

            let t = timeTillMaxSpeed;
            let v0 = car.speed;
            let a = car.accel;

            let distanceTillMaxSpeed = v0 * t + a * t * t / 2;

            return [timeTillMaxSpeed, distanceTillMaxSpeed];
        }

        return [0, 0];
    }

    getMinTimeTillCross(car, maxSpeed) {
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

        return timeTillMaxSpeed + (distanceLeft / maxSpeed);
    }

    onEnterControl(car) {
        car.controlledBy = this;
        car.color = color(128,128,255);
        car.crossControl = {
            path: car.road.crossPath,
            group: car.road.group
        }
        car.crossControl.group.queue.push(car);
        this.controlledCars.push(car);
    }

    onExitControl(car) {
        let index = this.controlledCars.indexOf(car);
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
        delete car.desiredSpeed;
    }

    manage() {
        // TODO:
        // Conectar aos carros que estao se aproximando
        // Definir velocidade de aproximacao
        // Definir qual semaforo abrir...

        this.paths.forEach( (path) => {
            path.enabled = 0;
        });

        this.entrances.forEach( (entrance) => {
            entrance.semaphore = 'red';
        });

        if (this.serverConnected) {

            this.entrances.forEach( (entrance) => {
                entrance.crossPath.enabled = 0;
                entrance.semaphore = 'blue';
            });

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

        } else {

            simulation.cars.forEach((car) => {
                if (car.controlledBy == this) {
                    this.onExitControl(car);
                }
            });

            let greens  = 12;
            let yellows = 3;
            let reds    = 3;
            let loops   = greens + yellows + reds;

            let cycle = parseInt((this.time / 1000)) % ((this.entranceGroups.length) * (loops));
            let i = 0;

            this.entranceGroups.forEach( (group) => {
                group.entrances.forEach((entrance)=>{
                    if (parseInt(cycle/loops) == i) {
                        let innerCycle = (cycle - reds) % loops;

                        if (innerCycle < greens) {
                            entrance.crossPath.enabled = 1;
                            entrance.semaphore = 'green';
                        } else if (innerCycle < greens + yellows) {
                            entrance.crossPath.enabled = 1;
                            entrance.semaphore = 'yellow';
                        }
                    }
                });

                i++;
            });
        }
    }

    display() {

        push();
        
        noFill();

        this.paths.forEach((path) => {
            path.display();
        });

        this.entrances.forEach( (entrance) => {

            let path = entrance.crossPath;

            if (entrance.semaphore == 'green') {
                path.displayCenterLine(color(0,255,0,128));
            } else if (path.enabled && entrance.semaphore == 'blue') {
                path.displayCenterLine(color(0,0,255,128));
            } else {
                path.displayCenterLine(color(255,0,0,128));
            }

            var cor;

            if (entrance.semaphore == 'green') {
                cor = color(0,255,0);
            } else if (entrance.semaphore == 'yellow') {
                cor = color(255,255,0);
            } else if (entrance.semaphore == 'blue') {
                cor = color(0,0,255);
            } else {
                cor = color(255,0,0);
            }

            push();
                strokeWeight(1);
                translate(entrance.getEnd().getVector());
                rotate(entrance.getEnd().dir);
                stroke(cor);
                fill(cor);
                rect(1, -this.width/2, 5, this.width);
            pop();
        });

        pop();

        push();

        fill(color(128,128,255));
        
        ellipse(this.center.x, this.center.y, 10, 10);
        pop();
    }

}