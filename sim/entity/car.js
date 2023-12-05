function Car(roadStart, width, length, route, _id, startDiff = 0) {
    this.type       = 'car';
    this.id       = _id;
    
    this.maxSpeed   = CAR_MAX_SPEED;
    this.turnSpeed  = CAR_TURN_SPEED;
    this.accel      = CAR_ACCEL;
    this.brakeAccel = CAR_BRAKE;
    this.position = roadStart.getStart().copy().forward(startDiff);

    this.road  = roadStart;
    this.route = route;

    this.speed = 0;
    this.length = length;
    this.width = width;

    this.brakeTime = 0;
    this.brakeLight = 0;
    this.passCurrentSemaphore = 0;

    this.gas = 0;

    this.lastMove = getMillis();
    this.lastManage = 0;
    this.time = 0;
    this.color = color(255,255,255);

    this.autonomousMode = false;
    this.server = null;
    this.nextConnectTry = 0;
    
    this.serverHook = new ServerHook(this);

    this.display = function() {
        this.move();

        push();

        translate(this.position.x, this.position.y);
        rotate(this.position.dir);

        stroke(0);
        fill(this.color);

        // Corpo do carro
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
        pop();
    }
    
    this.getRoadPosition = function() {
        let roadPosition = {
            position: null,
            distance: null,
            pathI: null,
        };
        
        for(i = 0; i <= 1; i += 0.01) {
            posI = this.road.path(i, true);
            disI = posI.distance(this.position);
            if (roadPosition.position == null || disI <= roadPosition.distance) {
                roadPosition.position = posI;
                roadPosition.distance = disI;
                roadPosition.pathI = i;
            }
        }

        return roadPosition;
    }

    this.startThread = function() {
        this.thread = setTimeout(async ()=>{
            while (1) {
                await this.manage();
                await sleep(SIMULATION_TICK_PERIOD);
                this.time += SIMULATION_TICK_PERIOD;
            }
        });
    }

    this.manage = async function() {
        if (await this.serverHook.manage()) {
            this.autonomousOperation();
        } else {
            this.legacyOperation();
        }
    }

    this.legacyOperation = function() {
        delete this.desiredSpeed;
        this.autonomousMode = false;

        this.color = color(255,255,255);
        this.run();
    }

    this.autonomousOperation = function() {

        let delay = getMillis() - this.serverHook.last_update;
        let last_info = this.serverHook.last_info;

        if (parseInt(Math.random()*100)==0){
            console.log(last_info);
        }

        if (last_info?.status == 'autonomous') {
            if (!this.autonomousMode) {
                this.autonomousMode = true;
                console.log("[Car] Iniciando operacao em modo autonomo.");
            }
            this.desiredSpeed = last_info.desiredSpeed;
            this.color = color(128,128,256);

            if (last_info.passCurrentSemaphore) {
                this.passCurrentSemaphore = 1;
            }
        } else {
            delete this.desiredSpeed;
            this.color = color(255,128,0);
        }

        this.run();

        let dataToSend = JSON.stringify(
            {
                type: 'position_update',
                position: this.position,
                speed: this.speed,
                road: this.road.id,
            }
        );

        this.serverHook.con.send(dataToSend);
    }

    this.run = function() {

        let timePassed = this.time - this.lastManage;

        if (timePassed > 100) {
            timePassed = 100;
        }

        this.lastManage = this.time;

        // Controle de velocidade por curva
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

            if (!this.autonomousMode || true) {
                let pos = this.position.copy();
                for (let i = 0; i < 10 * (1 + (dms_kmh(this.speed)/10)); i++) {
                    pos = pos.forward(5);
                    if (other.position.distance(pos) < 15 && this.speed > other.speed){
                        this.brakeTime = this.time + 100;
                    }
                }
            }
        });

        let roadPosition = this.getRoadPosition();
        
        if (this.road.next?.type == 'turn' && !this.autonomousMode) {
            let opa = 0.75;
            if (roadPosition.pathI > opa) {
                if (this.speed > this.turnSpeed) {
                    let p = (roadPosition.pathI - opa) / (1-opa);
                    let desiredSpeed = this.turnSpeed * (p) + this.speed * (1-p);
                    if (this.speed > desiredSpeed) {
                       this.brakeTime = this.time + 1;
                    }
                }
            }
        }

        if (roadPosition.pathI > 0.99) {
            if (this.road.next.type == 'crossroad') {
                this.road = this.road.crossPath;
            } else {
                this.road = this.road.next;
            }
        }

        if (this.desiredSpeed) {
            if (this.speed > this.desiredSpeed) {
               this.brakeTime = this.time + 10;
            }
        }
        
        if (this.road.semaphore) {
            if (!this.passCurrentSemaphore) {

                let red = this.road.semaphore == 'red';

                if (this.road.semaphore == 'green') {
                    if (roadPosition.pathI > 0.7) {
                        this.passCurrentSemaphore = 1;
                    }
                }

                if (this.road.semaphore == 'yellow') {
                    if (roadPosition.pathI > 0.6) {
                        if(roadPosition.pathI > 0.7 && this.speed >= 0.7*this.maxSpeed) {
                            this.passCurrentSemaphore = 1;
                        } else {
                            red = 1;
                        }
                    }
                }

                if (this.road.semaphore == 'blue') {
                    if (!this.autonomousMode) {
                        red = true;
                        this.color = color(255,128,128);
                    }
                }

                if (red) {
                    let opa = 0.5;
                    if (roadPosition.pathI > 0.95) {
                        this.brakeTime = this.time + 100;
                    } else if (roadPosition.pathI > opa) {
                        let p = (roadPosition.pathI - opa) / (1-opa);
                        let desiredSpeed = 0 * (p) + Math.max(this.speed, this.maxSpeed/3) * (1-p);
                        if (this.speed > desiredSpeed) {
                            this.brakeTime = this.time + 1;
                        }
                    }
                }
            }
        } else {
            this.passCurrentSemaphore = 0;
        }

        if (this.brakeTime > this.time) {
            this.brake = 1;
            this.gas   = 0;
        } else {
            this.brake = 0;
            this.gas   = 1;
        }
    }

    this.move = function() {
        let timePassed = getMillis() - this.lastMove;
        this.lastMove = getMillis();

        if (timePassed > 100) {
            timePassed = 100;
        }

        if (this.brake) {
            this.brakeLight = getMillis() + 200;
            this.speed = Math.max(0, this.speed - this.brakeAccel * (timePassed/1000));
        } else if (this.gas) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.accel * (timePassed/1000));
        }
        
        let roadPosition = this.getRoadPosition();

        this.position.dir = roadPosition.position.dir;
        
        // Correct to the center of the road
        if (roadPosition.pathI > 0.1 && roadPosition.distance > 1) {
            let roadD = this.road.path(roadPosition.pathI + 0.2);
            let expectedDir = createVector(1, 0).angleBetween(createVector(roadD.x - this.position.x, roadD.y - this.position.y));
            let diff = atan2(sin(expectedDir-this.position.dir), cos(expectedDir-this.position.dir));

            if (diff > Math.PI/8) diff = Math.PI/8;
            if (diff < -Math.PI/8) diff = -Math.PI/8;

            this.position.dir += diff;
        }

        this.position.x += this.speed * Math.cos(this.position.dir) * (timePassed/1000);
        this.position.y += this.speed * Math.sin(this.position.dir) * (timePassed/1000);
    }

    this.getCurrentRoutePosition = function() {
        var indexCurrent = this.route.indexOf(this.road.id);
        if (indexCurrent >= 0) return indexCurrent;
        indexCurrent = this.route.indexOf(this.road.before.id);
        if (indexCurrent >= 0) return indexCurrent;
        return -1;
    }
}