
function AllignedPosition(x, y, dir) {
    this.x   = x;
    this.y   = y;
    this.dir = dir;

    this.distance = function(other) {
        return Math.sqrt(Math.pow(this.x-other.x, 2)+Math.pow(this.y-other.y, 2));
    }

    this.copy = function() {
        return new AllignedPosition(
            this.x,
            this.y,
            this.dir
        );
    }

    this.forward = function(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir) * amt),
            this.y + (Math.sin(this.dir) * amt), 
            this.dir 
        );
    }

    this.left = function(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir - Math.PI/2) * amt),
            this.y + (Math.sin(this.dir - Math.PI/2) * amt), 
            this.dir 
        );
    };

    this.right = function(amt) {
        return new AllignedPosition( 
            this.x + (Math.cos(this.dir + Math.PI/2) * amt),
            this.y + (Math.sin(this.dir + Math.PI/2) * amt), 
            this.dir 
        );
    };

    this.rotate = function(radians) {
        return new AllignedPosition( 
            this.x,
            this.y, 
            this.dir + radians 
        );
    }

    this.getVector = function() {
        return createVector(this.x, this.y);
    }
}

function getMillis() {
    return Date.now();
}

