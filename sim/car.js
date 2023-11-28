
function Car(roadStart, width, lenght) {
    const brakeTime = 100;
    const blinkTime = 750;
    const blinkInterval = 250;
    const maxSpeed = 4;

    this.position = roadStart.start.copy();
    this.road = roadStart;
    this.nextRoad = null;

    this.speed = 0;
    this.length = lenght;
    this.width = width;

    this.brakeTime = 0;

    this.blinkRight = 0;
    this.blinkLeft  = 0;

    this.brake = 0;
    this.gas = 0;

    this.display = function() {
        push();

        translate(this.position.x, this.position.y);
        rotate(this.position.dir);

        noStroke();
        fill(color(255,255,255,100));
        ellipse(this.length/6, 0, this.length * 2, this.width * 2);

        stroke(0);
        fill(255);
        rect(-(this.length/3), -(this.width/2), this.length, this.width);

        // Luz de freio
        if (this.brakeTime > getMillis() || this.speed == 0) {
            fill(color(255,0,0));
            rect(-(this.length/3), -(this.width/2), 3, this.width);
        }

        // Luz da frente
        fill(color(255,255,128));
        rect((2*this.length/3), -(this.width/2), -3, this.width);
        
        // Seta para esquerda
        if (this.blinkLeft > getMillis() && (parseInt(getMillis()/blinkInterval) %2 == 0)) {
            fill(color(255,128,0));
            rect((2*this.length/3), -(this.width/2), -3, this.width/3);
        }

        // Seta para direita
        if (this.blinkRight > getMillis() && (parseInt(getMillis()/blinkInterval) %2 == 0)) {
            fill(color(255,128,0));
            rect((2*this.length/3), (this.width/2), -3, -this.width/3);
        }

        pop();
    }

    this.rotateLeft = function() {
        this.position.dir -= PI/16;
        this.blinkLeft = getMillis() + blinkTime;
    }

    this.rotateRight = function() {
        this.position.dir += PI/16;
        this.blinkRight = getMillis() + blinkTime;
    }

    this.startGas = function() {
        this.gas = 1;
    }

    this.endGas = function() {
        this.gas = 0;
    }

    this.startBrake = function() {
        this.brake = 1;
    }

    this.endBrake = function() {
        this.brake = 0;
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
        return this.road.end.distance(this.position);
    }

    this.move = function() {

        this.gas = 1;

        if (this.getRoadDistanceLeft() < Math.max(25, this.speed * 30) && (!this.road?.next || this.road == this.nextRoad)) {
            this.brakeTime = getMillis() + 100;
        } 

        cars.forEach( (other) => {
            if (other == this) return;
            
            if ((other.road == this.road && other.getRoadT()[2] > this.getRoadT()[2]) || other.road == this.road.next) {
                if (other.position.distance(this.position) < Math.max(50, this.speed * 50)) {
                    this.brakeTime = getMillis() + 100;
                }
            }
        });

        let roadT = this.getRoadT();
        let roadP = roadT[0];

        this.position.dir = roadP.dir;

        if (this.road.next) {
            this.nextRoad = this.road.next;
        }

        if (roadT[2] > 0.99) {
            this.road = this.nextRoad;
        }

        if (this.brakeTime > getMillis() || this.brake == 1) {
            this.speed -= 0.1;

            if (this.speed <= 0) {
                this.speed = 0;
            }

            this.gas = 0;
        } else if (this.gas) {
            this.speed += 0.05 / (1 + this.speed * 0.1);

            if (this.speed > maxSpeed) {
                this.speed = maxSpeed;
            }
        }

        if (roadT[2] > 0.1 && roadT[1] > 1) {
            let roadD = this.road.path(roadT[2] + 0.2);
            let expectedDir = createVector(1, 0).angleBetween(createVector(roadD.x - this.position.x, roadD.y - this.position.y));
            let diff = atan2(sin(expectedDir-this.position.dir), cos(expectedDir-this.position.dir));

            if (diff > Math.PI/8) diff = Math.PI/8;
            if (diff < -Math.PI/8) diff = -Math.PI/8;

            this.position.dir += diff;
        }
        

        this.position.x += this.speed * Math.cos(this.position.dir);
        this.position.y += this.speed * Math.sin(this.position.dir);
    }

}