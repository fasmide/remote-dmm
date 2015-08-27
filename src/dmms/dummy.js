var debug = require('debug')('dmm:dmms:Dummy'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

var Dummy = module.exports = function(options) {
	debug("Dummy dmm loaded....");

	setInterval(function() {
		this.emit('value', (Math.random() * 10 - 5).toFixed(3));
	}.bind(this), 250);
};

util.inherits(Dummy, EventEmitter);
