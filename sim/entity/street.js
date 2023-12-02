class Street {
    constructor(_start, _length, _width, _name = '') {
        this.type     = 'street';
        this.name     = _name;
        this.start    = _start.copy();
        this.length   = _length;
        this.width    = _width;
    }

    getStart() {
        return this.start.copy();
    }

    getEnd() {
        return this.start.forward(this.length);
    }

    path(t, calculateDir = true) {
        return this.start.forward(t * this.length);
    }

    display() {
        push();
            fill(0);
            translate(this.start.getVector());
            rotate(this.start.dir);
            rect(0, -this.width/2, this.length, this.width);

            stroke(128);

            translate(7, 0);
            for (let i = 0; i <= (this.length / 15) - 1; i++) {

                // TODO: coloracao quando chega perto do semaforo
                let grad = Math.min((i/((this.length / 15)))*255, 255);

                if (!this.next || this.semaphore == 'red') {
                    stroke(color(Math.max(grad, 128), 128-grad/2,128-grad/2));
                } else if (this.semaphore == 'green') {
                    stroke(color(128-grad/2,Math.max(grad, 128),128-grad/2));
                } else if (this.semaphore == 'blue') {
                    stroke(color(128-grad/2,128-grad/2,Math.max(grad, 128)));
                } else if (this.semaphore == 'yellow') {
                    stroke(color(Math.max(grad, 128),Math.max(grad, 128),128-grad/2));
                }

                triangle(0, 5, 6, 0, 0, -5);
                translate(15, 0);
            }
        pop();
    }

}