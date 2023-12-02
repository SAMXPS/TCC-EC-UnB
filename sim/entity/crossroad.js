
class CrossRoad {

    constructor(entrances, exits, width) {
        this.type = 'crossroad';

        this.entrances = entrances;
        this.exits = exits;

        this.paths = [];
        this.width = width;

        this.entrances.forEach( entrance => {
            entrance.next  = this;
            entrance.crossPaths = [];

            this.exits.forEach( exit => {
                exit.before = this;

                if (Math.abs(atan2(sin(entrance.getEnd().dir-exit.getStart().dir), cos(entrance.getEnd().dir-exit.getStart().dir))) <= (Math.PI/2 + 0.01)) {
                    let turn = new Turn(entrance, exit, this.width, '', false);
                    turn.cross = this;
                    turn.enabled = false;
                    this.paths.push(turn);
                    entrance.crossPaths.push(turn);
                }
            });
        });

        //this.paths[0].enabled = 1;
        this.carPassOrder = [];
    }

    controlCar(car) {
        const index = this.carPassOrder.indexOf(car);
        
        if (index == -1) {
            console.log("UAI");
            return;
        }

        if (index == 0) {
            car.color = color(128,255,128);
        }

        let min_speed  = kmh_dms(10);
        let speed_diff = kmh_dms(10);

        car.desiredSpeed = car.maxSpeed - index * speed_diff;

        if (car.desiredSpeed < min_speed) {
            car.desiredSpeed = min_speed;
        }

        /*if (car.speed > speed) {
            car.brakeTime = getMillis() + 0.1;
        } else {
            car.gas = 1;
        }*/
    }

    onEnterControl(car) {
        car.controlledBy = this;
        car.color = color(128,128,255);
        this.carPassOrder.push(car);
    }

    onExitControl(car) {
        const index = this.carPassOrder.indexOf(car);
        if (index > -1) {
            this.carPassOrder.splice(index, 1);
        }
        car.controlledBy = null;
        car.color = null;
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

        cars.forEach((car) => {
            if (car.isNearCross(this)) {
                let choice = car.getCrossChoice(car.road.crossPaths);
                if (choice) {
                    if (car.controlledBy != this) {
                        this.onEnterControl(car);
                    }
                    const index = this.carPassOrder.indexOf(car);
                    if (index == 0) {
                        choice.before.semaphore = 'blue';
                        choice.enabled = 1;
                    }
                    if (index == 1) {
                        choice.before.semaphore = 'yellow';
                        choice.enabled = 1;
                    }
                }
            } else if (car.road.cross == this) {
                let distance = car.getRoadDistanceLeft();
                if (distance < 20) {
                    this.onExitControl(car);
                } else if (this.carPassOrder[1]?.getRoadDistanceLeft() > distance + 20) {
                    this.onExitControl(car);
                }
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
    }

}