class CrossRoad {

    constructor(entrances, exits, width, id) {
        this.type = 'crossroad';
        this.id = id;

        this.entrances = entrances;
        this.exits = exits;

        this.paths = [];
        this.width = width;

        this.center = new AllignedPosition(0,0,0);

        this.controlledCars = [];
        this.entranceGroups = [];
        this.nextSort = 0;
        this.thread = null;
        this.time   = 0;
        this.colonyMode = false;

        this.serverHook = new ServerHook(this);
    }

    async loadPaths() {
        let count = 0;

        this.entrances.forEach( async (entrance) => {
            entrance.next = this;

            this.exits.forEach( async (exit) => {
                if (entrance.crossPath) {
                    return; 
                }

                if (Math.abs(atan2(sin(entrance.getEnd().dir-exit.getStart().dir), cos(entrance.getEnd().dir-exit.getStart().dir))) <= 0.01 /*(Math.PI/2 + 0.01)*/) {
                    exit.before = this;
                    let turn = new Turn(entrance, exit, this.width, generateSequentialId(), false);
                    turn.cross = this;
                    this.paths.push(turn);
                    entrance.crossPath = turn;
                }
            });

            this.center.x += entrance.getEnd().x;
            this.center.y += entrance.getEnd().y;
            count += 1;
        });

        this.center.x /= count;
        this.center.y /= count;

        this.entrances.forEach( entrance => {
            if (entrance.group) return;
            this.entrances.forEach( other => {
                if (other.group) return;
                let angle = Math.abs(atan2(sin(entrance.getEnd().dir-other.getEnd().dir), cos(entrance.getEnd().dir-other.getEnd().dir)));
                if (angle + 0.01 > Math.PI && angle - 0.01 < Math.PI) {
                    let group = {
                        entrances: [entrance,other],
                        queue: []
                    };

                    other.group = group;
                    entrance.group = group;
                    this.entranceGroups.push(group);
                }
            });
        });
    }

    startThread() {
        this.thread = setTimeout(async ()=>{
            while (1) {
                await this.manage();
                await sleep(SIMULATION_TICK_PERIOD);
                this.time += SIMULATION_TICK_PERIOD;
            }
        });
    }

    async manage() {
        if (await this.serverHook.manage()) {
            this.colonyOperation();
        } else {
            this.legacyOperation();
        }
    }

    getSetupData() {
        let groups = [];

        this.entranceGroups.forEach((group) => {
            let groupList = [];
            let entrances = group.entrances;
            console.log(entrances);

            entrances.forEach((entrance) => {
                groupList.push({
                    entrance: { 
                        id: entrance.id, 
                        end: entrance.getEnd()
                    },
                    path: {
                        id: entrance.crossPath.id,
                        end: entrance.crossPath.getEnd()
                    },
                    exit: {
                        id: entrance.crossPath.next?.id
                    }
                });
            });

            groups.push(groupList);
        });

        return {
            type: 'cross_setup',
            entranceGroups: groups,
        };
    }

    legacyOperation() {
        if (this.colonyMode) {
            this.time = 0;
            this.colonyMode = 0;
        }

        this.entrances.forEach( (entrance) => {
            entrance.semaphore = 'red';
        });

        let greens  = 12;
        let yellows = 3;
        let reds    = 3;
        let loops   = greens + yellows + reds;

        let cycle = parseInt((this.time / 1000)) % ((this.entranceGroups.length) * (loops));
        let i = 0;

        this.entranceGroups.forEach( (group) => {
            group.entrances.forEach((entrance)=>{
                if (parseInt(cycle/loops) == i) {
                    let innerCycle = (cycle) % loops;

                    if (innerCycle < reds) return;
                    innerCycle -= reds;

                    if (innerCycle < greens) {
                        entrance.semaphore = 'green';
                        return;
                    } 
                    innerCycle -= greens;

                    if (innerCycle < yellows) {
                        entrance.semaphore = 'yellow';
                    }
                }
            });

            i++;
        });
    }

    colonyOperation() {
        if (!this.colonyMode) {
            this.colonyMode = true;
            this.time = 0;
            console.log("[CrossRoad] Iniciando operacao em modo colonia.");
        }

        let last_info = this.serverHook.last_info;
        let last_update = this.serverHook.last_update;
        let sync_latency = getMillis() - last_update;

        var message = {
            type: 'cross_status',
        };

        // Semaforo começa vermelho pra aguardar os carros se conectarem.
        if (this.time < 5000) {
            message.status = 'loading';
        } else if (sync_latency > CROSS_MAX_LATENCY || last_info?.type != 'cross_update') {
            message.status = 'error';

            // Reset time when error occours.
            this.time = 0;
            console.log(last_info);
            console.log(sync_latency);
            console.log("cross road colony mode error!");
        } else {
            message.status = last_info?.status;
        }

        this.entrances.forEach( (entrance) => {
            entrance.semaphore = message.status == 'colony' ? 'blue' : 'red';
        });

        this.serverHook.sendMessage(message);
    }

    display() {
        push();
            noFill();

            this.paths.forEach((path) => {
                path.display();
            });

            this.entrances.forEach( (entrance) => {

                let path = entrance.crossPath;

                if (entrance.semaphore == 'green') {
                    path.displayCenterLine(color(0,255,0,128));
                } else if (entrance.semaphore == 'blue') {
                    path.displayCenterLine(color(0,0,255,128));
                } else {
                    path.displayCenterLine(color(255,0,0,128));
                }

                var cor;

                if (entrance.semaphore == 'green') {
                    cor = color(0,255,0);
                } else if (entrance.semaphore == 'yellow') {
                    cor = color(255,255,0);
                } else if (entrance.semaphore == 'blue') {
                    cor = color(0,0,255);
                } else {
                    cor = color(255,0,0);
                }

                push();
                    strokeWeight(1);
                    translate(entrance.getEnd().getVector());
                    rotate(entrance.getEnd().dir);
                    stroke(cor);
                    fill(cor);
                    rect(1, -this.width/2, 5, this.width);
                pop();
            });
        pop();

        push();
            // Desenha o centro redondo do cruzamento
            fill(0);
            ellipse(this.center.x, this.center.y, 20, 20);

            if (parseInt(getMillis() / 500) % 2 == 0) {
                fill(0);
            } else if (this.colonyMode) {
                fill(color(0,0,255));
            } else {
                fill(color(255,255,0));
            }

            ellipse(this.center.x, this.center.y, 10, 10);
        pop();
    }

}