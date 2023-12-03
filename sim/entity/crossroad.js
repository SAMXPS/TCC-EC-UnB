
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
            entrance.next  = this;
            entrance.crossPaths = [];

            this.exits.forEach( exit => {
                exit.before = this;

                if (Math.abs(atan2(sin(entrance.getEnd().dir-exit.getStart().dir), cos(entrance.getEnd().dir-exit.getStart().dir))) <= 0.01 /*(Math.PI/2 + 0.01)*/) {
                    let turn = new Turn(entrance, exit, this.width, '', false);
                    turn.cross = this;
                    turn.enabled = false;
                    this.paths.push(turn);
                    entrance.crossPaths.push(turn);
                }
            });

            this.center.x += entrance.getEnd().x;
            this.center.y += entrance.getEnd().y;
            count += 1;
        });

        this.center.x /= count;
        this.center.y /= count;

        console.log(this.center);

        //this.paths[0].enabled = 1;
        this.controlledCars = [];
        this.controlledCarsLastSort = 0;
    }

    getMinTimeTillCross(car, maxSpeed) {
        let distance = car.position.distance(car.crossControl.choice.getEnd());
        
        let timeTillMaxSpeed = 0;
        let distanceTillMaxSpeed = 0;

        if (car.speed < maxSpeed) {
            let speedDiff = maxSpeed - car.speed;
            // Tempo em segundos para atingir velocidade maxima
            timeTillMaxSpeed = (speedDiff / car.accel);

            let t = timeTillMaxSpeed;
            let v0 = car.speed;
            let a = car.accel;

            distanceTillMaxSpeed = v0 * t + a * t * t / 2;
        }

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

    controlCar(car) {
       // car.desiredSpeed = kmh_dms(10);
    }

    onEnterControl(car) {
        car.controlledBy = this;
        car.color = color(128,128,255);
        car.crossControl = {
            
        }
        this.controlledCars.push(car);
    }

    onExitControl(car) {
        const index = this.controlledCars.indexOf(car);
        if (index > -1) {
            this.controlledCars.splice(index, 1);
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

        this.entrances.forEach( (entrance) => {
            entrance.crossPaths.forEach((path) => {
                path.enabled = 0;
            });
            entrance.semaphore = 'red';
        });
        
        let myCars = this.controlledCars;

        myCars.forEach((car) => {
            car.crossControl.minTimeTillCross = this.getMinTimeTillCross(car, car.maxSpeed);
        })
        
        //function compareCars(a, b) {
        //    return a.crossControl.minTimeTillCross - b.crossControl.minTimeTillCross;
        //}

        //myCars.sort(compareCars);

        let lastTime = null;
        let maxSpeed = null;
        let minInterval = 0; // um segundo
        let index = 0;

        const minDistance = this.width * 4;

        let lastCar = null;

        myCars.forEach((car) => {
            car.crossControl.index = index;

            if (!lastTime) {
                car.desiredSpeed = car.maxSpeed;
                lastTime = car.crossControl.minTimeTillCross;
                car.crossControl.timeTillCross = lastTime;
                maxSpeed = car.maxSpeed;
                //console.log("first speed = " + car.desiredSpeed + " time = " + car.crossControl.minTimeTillCross);
                
                if (car.road.cross) {
                    car.crossControl.choice.before.semaphore = 'red';
                } else {
                    car.crossControl.choice.before.semaphore = 'blue';
                    index++;
                }
                lastCar = car;
                return;
            }

            if (index == 0) {
                car.crossControl.choice.before.semaphore = 'blue';
            }
            
            if (index == 1) {
                car.crossControl.choice.before.semaphore = 'yellow';
            }

            if (car.maxSpeed < maxSpeed) {
                maxSpeed = car.maxSpeed;
            }
            
            let currentTime = this.getMinTimeTillCross(car, maxSpeed);

            if (lastCar.road != car.road) {
                //maxSpeed -= kmh_dms(5);

                if (maxSpeed < kmh_dms(5)) {
                    maxSpeed = kmh_dms(5);
                }

                //maxSpeed = car.maxSpeed;
    
                minInterval = minDistance / maxSpeed;
    
                while (currentTime - lastTime < minInterval && maxSpeed > kmh_dms(5)) {
                    maxSpeed -= 1;
                    currentTime = this.getMinTimeTillCross(car, maxSpeed);
                    minInterval = minDistance / maxSpeed;
                }
            }

            //console.log("min = " + minInterval);
            car.desiredSpeed = maxSpeed;
            lastTime = currentTime;
            car.crossControl.timeTillCross = lastTime;
            index++;
            lastCar = car;
            //console.log("speed = " + car.desiredSpeed + " time = " + currentTime);
        });

        if ( getMillis() - this.controlledCarsLastSort > 100 && false ) {

            myCars.forEach((car)=>{
                myCars.forEach((other)=> {
                    if (other == car) {
                        return;
                    }
                    if (car.road == other.road) {
                        let compTime = this.getMinTimeTillCross(car, other.desiredSpeed);
                        if (compTime < car.crossControl.timeTillCross) {
                            car.crossControl.timeTillCross = compTime;
                        }
                    }
                })
            });

            function compareCars(a, b) {
                return a.crossControl.timeTillCross - b.crossControl.timeTillCross;
            }

            this.myCars = myCars.sort(compareCars);
            
            this.controlledCarsLastSort = getMillis();
        }

        cars.forEach((car) => {
            if (car.isNearCross(this)) {
                let choice = car.getCrossChoice(car.road.crossPaths);
                if (choice) {
                    if (car.controlledBy != this) {
                        this.onEnterControl(car);
                        car.crossControl.choice = choice;
                    }
                }
            } else if (car.road.cross == this) {

            } else if (car.controlledBy == this) {
                this.onExitControl(car);
            }
        });

        let cycle = parseInt((getMillis() / 1000) / 5) % (this.entrances.length * 2);

        let i = 0;


        /*this.entrances.forEach( (entrance) => {
            
            let green = true;
            let blue = false;

            entrance.crossPaths.forEach((path) => {
                if (path.enabled) {
                    blue = true;
                } else {
                    green = false;
                }
            });

            if (green) {
                entrance.semaphore = 'green';
            } else if (blue) {
                entrance.semaphore = 'blue';
            } else {
                entrance.semaphore = 'red';
            }
        });*/
    }

    display() {

        push();
        
        noFill();

        this.paths.forEach((path) => {
            path.display();
        });

        this.entrances.forEach( (entrance) => {

            entrance.crossPaths.forEach((path) => {
                if (entrance.semaphore == 'green') {
                    path.displayCenterLine(color(0,255,0,128));
                } else if (path.enabled && entrance.semaphore == 'blue') {
                    path.displayCenterLine(color(0,0,255,128));
                } else {
                    path.displayCenterLine(color(255,0,0,128));
                }
            });

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