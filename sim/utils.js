
class AllignedPosition {

    constructor(x, y, dir) {
        this.x   = x;
        this.y   = y;
        this.dir = dir;
    }

    distance(other) {
        return Math.sqrt(Math.pow(this.x-other.x, 2)+Math.pow(this.y-other.y, 2));
    }

    average(other) {
        return new AllignedPosition(
            (this.x + other.x) / 2,
            (this.y + other.y) / 2,
            (this.dir + other.dir) / 2
        );
    }

    copy() {
        return new AllignedPosition(
            this.x,
            this.y,
            this.dir
        );
    }

    forward(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir) * amt),
            this.y + (Math.sin(this.dir) * amt), 
            this.dir 
        );
    }

    left(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir - Math.PI/2) * amt),
            this.y + (Math.sin(this.dir - Math.PI/2) * amt), 
            this.dir 
        );
    };

    right(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir + Math.PI/2) * amt),
            this.y + (Math.sin(this.dir + Math.PI/2) * amt), 
            this.dir 
        );
    };

    rotate(radians) {
        return new AllignedPosition( 
            this.x,
            this.y, 
            this.dir + radians 
        );
    }

    getVector() {
        return createVector(this.x, this.y);
    }
}

function parseAllignedPosition(obj) {
    return new AllignedPosition(obj.x, obj.y, obj.dir);
}

function calculateDistanceToBrake(speed, accel) {
    // Derivado da equacao de Torricelli
    return Math.pow(speed, 2) / (2 * accel);
}

function getDistanceTimeTillMaxSpeed(car, maxSpeed) {
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

function getMinTimeTillLocation(car, maxSpeed, location) {
    let distance = car.position.distance(location);
    
    let [timeTillMaxSpeed, distanceTillMaxSpeed] = getDistanceTimeTillMaxSpeed(car, maxSpeed);

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

function getMillis() {
    return Date.now();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function kmh_dms(kmh) {
    return kmh / 0.36;
}

function dms_kmh(dms) {
    return dms * 0.36;
}

function ms_kmh(ms) {
    return ms * 3.6;
}

function dm_m(dm) {
    return dm/10;
}

async function sha1_hash(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
    return hashHex;
}

async function generateRandomId() {
    return await sha1_hash(Date.now() + "." + Math.random());
}

var _____seq_id_for_generation = 0;
function generateSequentialId() {
    return _____seq_id_for_generation++;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}