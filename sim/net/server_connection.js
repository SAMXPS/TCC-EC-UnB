function serverConnect() {
    return new Promise((resolve, reject) => {
        const timeout = 20000; //ms

        let resolved = 0;

        const ws = new WebSocket('ws://localhost:50024');

        ws.onerror = (e) => {
            if (!resolved) {
                resolved = 1;
                reject(new Error("Server connection timed out."));
            }
        };

        ws.onopen = function() {
            resolved = 1;
            resolve(ws);
        };

        setTimeout(() => {
            if (!resolved) {
                resolved = 1;
                reject(new Error("Server connection timed out."));
            }
        }, timeout);
    });
}

class ServerHook {

    constructor(entity) {
        this.entity = entity;
        this.server = null;
        this.nextConnectTry = getMillis() + 1000;

        this.con = null;
        this.load_sent = false;
        this.last_update = null;
        this.last_info = null;
    }

    async manage() {
        try {
            if (!this.con) {
                if ( getMillis() > this.nextConnectTry) {
                    console.log(this.entity.type + ":" + this.entity.id + " conneting....");
                    
                    serverConnect().then((con)=>{
                        this.con = con;
                    }).catch((e)=>{
                        console.log(this.entity.type + ":" + this.entity.id + " connection failed....");
                        this.resetOperation();
                    });

                    this.resetOperation(30000);
                }
            } else if (!this.load_sent) {
                let hook = this;
                let con  = hook.con;

                this.con.onmessage = (data) => {
                    let msg = data.data;
    
                    if (hook.con != con) {
                        console.log("not this connection");
                        return;
                    }
                    
                    if (!hook.loaded) {
                        if (msg == 'load_ok') {
                            hook.loaded = 1;
                            console.log(hook.entity.type + " connected!");
                        }
                        return;
                    }
    
                    try {
                        if (msg == "ping") {
                            hook.con.send("pong");
                        } else {
                            hook.last_info   = JSON.parse(msg);
                            hook.last_update = getMillis();
                        }
                    } catch (e) {
                        console.log(e);
                        hook.resetOperation();
                    } 
                };
    
                this.con.send(simulation.id);
                this.con.send(this.entity.type);
                this.con.send(this.entity.id);

                if (this.entity.type == 'crossroad') {
                    this.sendMessage(this.entity.getSetupData());
                }

                this.load_sent = 1;
            }
            
            if (this.loaded) {
                if (!this.con || this.con.readyState == WebSocket.CLOSED) {
                    throw new Error("Connection Closed!");
                }
                return true;
            }
        } catch (e) {
            console.log(e);
            this.resetOperation();
        } 

        return false;
    }

    resetOperation(delay = 5000) {
        let oldConnection = this.con;

        setTimeout(()=>{
            try {
                oldConnection.close();
            } catch (e) {

            }
        });

        this.nextConnectTry = getMillis() + delay;
        this.con = null;
        this.load_sent = false;
        this.last_update = null;
        this.last_info = null;
        this.loaded = false;
    }

    sendMessage(payload_obj) {
        try {
            this.con.send(JSON.stringify(payload_obj));
        } catch (e) {
            console.log(e);
            this.resetOperation();
        }
    }

}