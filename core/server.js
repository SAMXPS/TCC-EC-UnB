var echo_server = require('./echo_server.js');
var traffic_controller = require('./traffic_controller.js');

// Chama os servidores.
echo_server.run();
traffic_controller.run();