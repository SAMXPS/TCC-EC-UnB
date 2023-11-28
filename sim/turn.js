function Turn(name, start, end, width) {

    this.name   = name;
    this.type   = 'turn';
    this.start  = start;
    this.end    = end;
    this.width  = width;

    this.p1 = this.start.copy();
    this.p2 = this.start.forward(width);
    this.p3 = this.end.forward(-width);
    this.p4 = this.end.copy();


    this.path = function(t, calculateDir = false) {

        if (t < 0) return start.copy().forward(width*t);
        if (t > 1) return end.copy().forward(width*(t-1));

        let pointX = bezierPoint(this.p1.x, this.p2.x, this.p3.x, this.p4.x, t); 
        let pointY = bezierPoint(this.p1.y, this.p2.y, this.p3.y, this.p4.y, t); 
        
        dir = 0;

        if (calculateDir) {
            nextT = this.path(t+0.05,false);
            dir = createVector(1, 0).angleBetween(createVector(nextT.x - pointX, nextT.y - pointY));
        }

        return new AllignedPosition(pointX, pointY, dir);
    }

    this.display = function() {
        push();
            noFill();
            strokeWeight(width+1);
            
            bezier(
                this.p1.x, this.p1.y, 
                this.p2.x, this.p2.y, 
                this.p3.x, this.p3.y, 
                this.p4.x, this.p4.y
            );
            /*for (i = -0.5; i <= 1.5; i+=0.1){
                strokeWeight(1);
                opa = this.path(i, true);
                forward = opa.forward(15);
                stroke(0);
                ellipse(opa.x, opa.y, 1, 1); 
                stroke(100);
                line(opa.x, opa.y, forward.x, forward.y); 
            }*/
        pop();
    }

}