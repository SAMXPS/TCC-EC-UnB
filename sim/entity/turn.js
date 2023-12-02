class Turn {

    constructor(before, next, width, name='', auto_connect = true) {
        if (before?.type != 'street' || next?.type != 'street') {
            throw new Error("Turn can only be used to connect Streets.");
        }

        this.type   = 'turn';
        this.name   = name;
        this.before = before;
        this.next   = next;
        this.width  = width;

        this.p1 = this.getStart().copy();
        this.p2 = this.getStart().forward(width);
        this.p3 = this.getEnd().forward(-width);
        this.p4 = this.getEnd().copy();

        if (auto_connect) {
            // double linked stuff
            this.before.next = this;
            this.next.before = this;
        }
    }

    getStart() {
        return this.before?.getEnd();
    }

    getEnd() {
        return this.next?.getStart();
    }

    path(t, calculateDir = false) {

        if (t < 0) return this.before.path(1+t);
        if (t > 1) return this.next.path(t-1);

        let pointX = bezierPoint(this.p1.x, this.p2.x, this.p3.x, this.p4.x, t); 
        let pointY = bezierPoint(this.p1.y, this.p2.y, this.p3.y, this.p4.y, t); 
        
        let dir = 0;

        if (calculateDir) {
            let nextT = this.path(t+0.05,false);
            dir = createVector(1, 0).angleBetween(createVector(nextT.x - pointX, nextT.y - pointY));
        }

        return new AllignedPosition(pointX, pointY, dir);
    }

    display() {
        push();
            noFill();
            strokeWeight(this.width+1);
            
            bezier(
                this.p1.x, this.p1.y, 
                this.p2.x, this.p2.y, 
                this.p3.x, this.p3.y, 
                this.p4.x, this.p4.y
            );
        pop();
    }

    displayCenterLine(color) {
        push();
            let start = this.getStart();
            let p1 = start.forward(-15);
            let p2 = start.forward(25);
            let end = this.getEnd();
            let p3 = end.forward(-25);
            let p4 = end.forward(15);

            stroke(color);

            bezier(
                p1.x, p1.y, 
                p2.x, p2.y, 
                p3.x, p3.y, 
                p4.x, p4.y
            );
        pop();
    }

}