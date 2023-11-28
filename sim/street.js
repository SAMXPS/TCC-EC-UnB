function Street(_name, _start, _lenght, _width) {

    this.name   = _name;
    this.type   = 'street';
    this.start  = _start.copy();
    this.lenght = _lenght;
    this.end    = this.start.forward(this.lenght);
    this.width  = _width;

    this.path = function(t) {
        return this.start.forward(t * this.lenght);
    }

    this.display = function() {
        push();
            fill(0);
            translate(this.start.getVector());
            rotate(this.start.dir);
            rect(0, -this.width/2, this.lenght, this.width);

            stroke(128);

            translate(7, 0);
            for (i = 0; i <= (this.lenght / 15) - 1; i++) {
                let grad = Math.min((i/((this.lenght / 15)))*255, 255);

                if (!this.next) {
                    stroke(color(Math.max(grad, 128), 128-grad/2,128-grad/2));
                } else if (this.next?.cross) {
                    stroke(color(128-grad/2,Math.max(grad, 128),128-grad/2));
                }

                triangle(0, 5, 6, 0, 0, -5);
                translate(15, 0);
            }
        pop();
    }

}