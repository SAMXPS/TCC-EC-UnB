function CrossRoad(entrances, exits, width) {

    this.type = 'crossroad';
    this.topCorner = null;
    this.bottonCorner = null;
    this.entrances = entrances;
    this.exits = exits;
    this.paths = [];
    this.width = width;

    this.entrances.forEach( streetX => {

        let entrance = streetX.end.copy();

        if (this.topCorner == null) {
            this.topCorner = entrance.copy();
        }

        if (this.bottonCorner == null) {
            this.bottonCorner = entrance.copy();
        }

        if (this.topCorner.x < entrance.x) {
            this.topCorner.x = entrance.x;
        }

        if (this.topCorner.y < entrance.y) {
            this.topCorner.y = entrance.y;
        }

        if (this.bottonCorner.x > entrance.x) {
            this.bottonCorner.x = entrance.x;
        }

        if (this.bottonCorner.y > entrance.y) {
            this.bottonCorner.y = entrance.y;
        }

        this.exits.forEach( streetY => {
            let exit = streetY.start.copy();
            if (Math.abs(atan2(sin(entrance.dir-exit.dir), cos(entrance.dir-exit.dir))) <= (Math.PI/2 + 0.01)) {
                let turn = new Turn('crossTurn', entrance, exit, width);
                turn.next = streetY;
                turn.cross = this;
                this.paths.push({
                    start: streetX,
                    next:  streetY,
                    entrance: entrance,
                    exit: exit,
                    turn: turn,
                });
            }
        });
    });

    this.exits.forEach( exit => {
        if (this.topCorner.x < exit.x) {
            this.topCorner.x = exit.x;
        }

        if (this.topCorner.y < exit.y) {
            this.topCorner.y = exit.y;
        }

        if (this.bottonCorner.x > exit.x) {
            this.bottonCorner.x = exit.x;
        }

        if (this.bottonCorner.y > exit.y) {
            this.bottonCorner.y = exit.y;
        }
    });

    this.paths.forEach( (path) => {
        if (path.start.name == 'streetB' && path.next.name == 'streetC') {
            path.start.next = path.turn;
        }
        if (path.start.name == 'streetD' && path.next.name == 'streetE') {
            path.start.next = path.turn;
        }
        if (path.start.name == 'streetF' && path.next.name == 'streetG') {
            path.start.next = path.turn;
        }
        if (path.start.name == 'streetH' && path.next.name == 'streetA') {
            path.start.next = path.turn;
        }
    });

    this.display = function() {
        if (parseInt(getMillis()/2000)%4==0){
            this.paths.forEach( (path) => {
                path.start.next = null;
            });
            this.paths.forEach( (path) => {
                if (path.start.name == 'streetB' && path.next.name == 'streetC') {
                    path.start.next = path.turn;
                }
                if (path.start.name == 'streetD' && path.next.name == 'streetE') {
                    path.start.next = path.turn;
                }
                if (path.start.name == 'streetF' && path.next.name == 'streetG') {
                    path.start.next = path.turn;
                }
                if (path.start.name == 'streetH' && path.next.name == 'streetA') {
                    path.start.next = path.turn;
                }
            });
        } else if (parseInt(getMillis()/2000)%4==2){
            this.paths.forEach( (path) => {
                path.start.next = null;
            });
            this.paths.forEach( (path) => {
                if (path.start.name == 'streetB' && path.next.name == 'streetE') {
                    path.start.next = path.turn;
                }
                if (path.start.name == 'streetF' && path.next.name == 'streetA') {
                    path.start.next = path.turn;
                }
            });
        } else {
            this.paths.forEach( (path) => {
                path.start.next = null;
            });
        }

        push();

        //fill(0);
        //stroke(color(255,0,0));
        
        /*rect(
            this.bottonCorner.x, 
            this.bottonCorner.y,
            this.topCorner.x - this.bottonCorner.x,
            this.topCorner.y - this.bottonCorner.y,
            20
        )*/
        
        //strokeWeight(3);
        noFill();
        this.paths.forEach((path) => {
            path.turn.display();
        });

        this.paths.forEach((path) => {
            push();
                start = path.entrance;
                start_control = start.forward(-15);
                start = start.forward(25);
                end = path.exit;
                end_control = end.forward(15);
                end = end.forward(-25);

                var cor;

                if (path.start.next == path.turn) {
                    cor = color(0,255,0);
                } else {
                    cor = color(255,0,0, 128);
                }

                stroke(cor);

                //line(start_control.x,start_control.y,start.x,start.y);
                bezier(
                    start_control.x, 
                    start_control.y, 
                    start.x, 
                    start.y, 
                    end.x, 
                    end.y, 
                    end_control.x, 
                    end_control.y
                );
            pop();
        });

        this.entrances.forEach( (entrance) => {

            if (entrance.next) {
                cor = color(0,255,0);
            } else {
                cor = color(255,0,0);
            }

            push();
                strokeWeight(1);
                translate(entrance.end.getVector());
                rotate(entrance.end.dir);
                stroke(cor);
                fill(cor);
                rect(1, -width/2, 5, width);
            pop();
        });

        pop();
    }

}