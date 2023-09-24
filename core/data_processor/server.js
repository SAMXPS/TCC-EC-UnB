var echo_server = require('./echo_server.js');
var data_server = require('./data_server.js');

// Chama os servidores.
echo_server.run();
data_server.run();