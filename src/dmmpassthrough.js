var WebSocketServer = require('ws').Server,
	debug = require('debug')('dmm:DmmPassthrough');

var DmmPassthrough = module.exports = function(server) {

	this.wss = new WebSocketServer({ server: server });
	this.bind();
};

DmmPassthrough.prototype.bind = function() {

	wss.on('connection', function connection(ws) {

		ws.on('message', function incoming(message) {
			debug('received: %j', message);
		});

		ws.send('something');
	});

};

