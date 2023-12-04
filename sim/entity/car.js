function Car(roadStart, width, length, route, startDiff = 0) {
    const brakeTime = 100;
    const blinkTime = 750;
    const blinkInterval = 250;
    this.maxSpeed   = kmh_dms(60);
    this.accel      = 25; // 2.5 m/s^2
    this.brakeAccel = 70; // 7.0 m/s^2
    this.turnSpeed  = kmh_dms(40);

    this.position = roadStart.getStart().copy().forward(startDiff);
    this.road = roadStart;
    this.route = route;

    this.speed = 0;
    this.length = length;
    this.width = width;

    this.brakeTime = 0;
    this.brakeLight = 0;
    this.crossDesicion = 0;

    this.gas = 0;

    this.lastMove = getMillis();
    this.lastManage = 0;
    this.time = 0;

    this.startThread = function() {
        this.thread = setTimeout(async ()=>{
            while (1) {
                this.manage();
                await sleep(SIMULATION_TICK_PERIOD);
                this.time += SIMULATION_TICK_PERIOD;
            }
        });
    }

    this.display = function() {
        push();

        translate(this.position.x, this.position.y);
        rotate(this.position.dir);

        noStroke();
        fill(color(255,255,255,100));
        //ellipse(this.length/6, 0, this.length * 2, this.width * 2);

        stroke(0);
        fill(255);
        if (this.controlledBy) {
            fill(this.color);
        }
        rect(-(this.length/3), -(this.width/2), this.length, this.width);

        // Luz de freio
        if (this.brakeLight > getMillis() || this.speed == 0) {
            fill(color(255,0,0));
            rect(-(this.length/3), -(this.width/2), 5, this.width);
        }

        // Luz da frente
        fill(color(255,255,128));
        rect((2*this.length/3), -(this.width/2), -5, this.width);
        
        translate(0,this.width*1.5);
        stroke(0);
        strokeWeight(5);
        fill(color(255,255,255));
        rotate(-this.position.dir);
        text(dms_kmh(this.speed).toFixed(0) + "km/h", 0, 0);
        if (this.crossControl) {
            text("pos=" + this.crossControl.index, 0, 10);
        }
        pop();
    }

    this.getRoadT = function() {
        let smallest = [null, null, null];
        
        for(i = 0; i <= 1; i += 0.01) {
            posI = this.road.path(i, true);
            disI = posI.distance(this.position);
            if (smallest[0] == null || disI <= smallest[1]) {
                smallest = [posI, disI, i];
            }
        }

        return smallest;
    }

    this.getRoadDistanceLeft = function() {
        return this.road.getEnd().distance(this.position);
    }
    this.manage = function() {

        let timePassed = this.time - this.lastManage;

        if (timePassed > 100) {
            timePassed = 100;
        }

        this.lastManage = this.time;

        if (this.road.type == 'turn' && !this.road.cross) {
            if (this.speed > this.turnSpeed) {
                this.brakeTime = this.time + 100;
            }
        }

        this.gas = 1;
        
        simulation.cars.forEach( (other) => {
            if (other == this) return;
            
            if (other.position.distance(this.position) < Math.max(this.length, this.width)) {
                console.log("crashed!!!");
            }

            if (other.road != this.road) {
                return;
            }

            if (!this.controlledBy || true) {
                let pos = this.position.copy();
                for (let i = 0; i < 10 * (1 + (dms_kmh(this.speed)/10)); i++) {
                    pos = pos.forward(5);
                    if (other.position.distance(pos) < 15 && this.speed > other.speed){
                        this.brakeTime = this.time + 100;
                    }
                }
            }
            // TODO freiar para evitar acidentes
        });

        let roadT = this.getRoadT();
        let roadP = roadT[0];
        
        if (this.road.next?.type == 'turn' && !this.controlledBy) {
            let opa = 0.75;
            if (roadT[2] > opa) {
                if (this.speed > this.turnSpeed) {
                    let p = (roadT[2] - opa) / (1-opa);
                    let desiredSpeed = this.turnSpeed * (p) + this.speed * (1-p);
                    if (this.speed > desiredSpeed) {
                       this.brakeTime = this.time + 1;
                    }
                }
            }
        }

        this.position.dir = roadP.dir;

        if (roadT[2] > 0.99) {
            if (this.road.next.type == 'crossroad') {
                this.road = this.road.crossPath;
            } else {
                this.road = this.road.next;
            }
        }

        if (this.desiredSpeed) {
            if (this.speed < this.desiredSpeed) {
                this.gas = 1;
            } else {
               this.brakeTime = this.time + 10;
            }
        }

        if (!this.controlledBy && this.road.semaphore) {
            if (!this.crossDesicion) {
                let red = this.road.semaphore == 'red';

                if (this.road.semaphore == 'yellow') {
                    if (roadT[2] > 0.6) {
                        if(roadT[2] > 0.7 && this.speed >= 0.7*this.maxSpeed) {
                            this.crossDesicion = 1;
                        } else {
                            red = 1;
                        }
                    }
                }

                if (red) {
                    let opa = 0.5;
                    if (roadT[2] > 0.95) {
                        this.brakeTime = this.time + 100;
                    } else if (roadT[2] > opa) {
                        let p = (roadT[2] - opa) / (1-opa);
                        let desiredSpeed = 0 * (p) + Math.max(this.speed, this.maxSpeed/3) * (1-p);
                        if (this.speed > desiredSpeed) {
                            this.brakeTime = this.time + 1;
                        }
                    }
                }
            } else {
                this.gas = 1;
            }
        } else {
            this.crossDesicion = 0;
        }
        
        if (this.brakeTime > this.time) {
            //this.speed -= 0.1;
            this.speed -= this.brakeAccel * (timePassed/1000);

            if (this.speed <= 0) {
                this.speed = 0;
            }

            this.brakeLight = getMillis() + 200;
        } else if (this.gas) {
            this.speed += this.accel * (timePassed/1000);

            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
        }


        // Correct to the center of the road
        if (roadT[2] > 0.1 && roadT[1] > 1) {
            let roadD = this.road.path(roadT[2] + 0.2);
            let expectedDir = createVector(1, 0).angleBetween(createVector(roadD.x - this.position.x, roadD.y - this.position.y));
            let diff = atan2(sin(expectedDir-this.position.dir), cos(expectedDir-this.position.dir));

            if (diff > Math.PI/8) diff = Math.PI/8;
            if (diff < -Math.PI/8) diff = -Math.PI/8;

            this.position.dir += diff;
        }
    }

    this.move = function() {
        let timePassed = getMillis() - this.lastMove;
        this.lastMove = getMillis();

        if (timePassed > 100) {
            timePassed = 100;
        }
        
        this.position.x += this.speed * Math.cos(this.position.dir) * (timePassed/1000);
        this.position.y += this.speed * Math.sin(this.position.dir) * (timePassed/1000);
    }

    this.getCurrentRoutePosition = function() {
        var indexCurrent = this.route.indexOf(this.road.name);
        if (indexCurrent >= 0) return indexCurrent;
        indexCurrent = this.route.indexOf(this.road.before.name);
        if (indexCurrent >= 0) return indexCurrent;
        return -1;
    }

    this.isNearCross = function(cross) {
        return this.road.next == cross;
    }
}