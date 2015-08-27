var debug = require('debug')('dmm:dmms:Dummy'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

var Dummy = module.exports = function(options) {
	debug("Dummy dmm loaded....");
	var y = 0;
	setInterval(function() {
		y += (Math.random() * 10 - 5);
		this.emit('value', y.toFixed(3));
	}.bind(this), 10);
};

util.inherits(Dummy, EventEmitter);
