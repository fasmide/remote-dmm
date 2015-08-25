var debug = require('debug')('dmm:DmmClient');

var DmmClient = module.exports = function() {
	this.socket = new WebSocket('ws://localhost:3000/');
	this.socket.onmessage = this.onMessage.bind(this);
	this.socket.onopen = this.onOpen.bind(this);
};

DmmClient.prototype.onMessage = function(msg) {
	debug("We had a message: %j", msg);
};

DmmClient.prototype.onOpen = function() {
	debug("We have connection!");
};