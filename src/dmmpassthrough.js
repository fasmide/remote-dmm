var WebSocketServer = require('ws').Server,
	debug = require('debug')('dmm:DmmPassthrough'),
	util = require('util');

var DmmPassthrough = module.exports = function(server) {

	this.wss = new WebSocketServer({ server: server });
	this.setup();
};

DmmPassthrough.prototype.setup = function() {

	this.wss.on('connection', this.connection.bind(this));

	var dmmName = process.env.DMM || 'dummy';
	var dmmPath = util.format('./dmms/%s', dmmName);

	debug("Loading dmm module %s from %s", dmmName, dmmPath);

	var dmm = require(dmmPath);
	this.dmm = new dmm({option: 'one'});

	this.dmm.on('value', this.incomingReading.bind(this));
};

DmmPassthrough.prototype.connection = function(ws) {
	debug("New connection");
};

DmmPassthrough.prototype.incomingReading = function(data) {
	data = data.toString();

	this.wss.clients.forEach(function (client) {
		try {
			client.send(JSON.stringify({value: data, type: 'reading'}));

		} catch(e) {

		}
	});
};