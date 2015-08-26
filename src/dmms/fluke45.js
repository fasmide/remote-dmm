var debug = require('debug')('dmm:dmms:Fluke45'),
	com = require('serialport'),
	SerialPort = com.SerialPort,

	EventEmitter = require('events').EventEmitter,
	util = require('util');


var Fluke45 = module.exports = function(options) {
	debug("Opening fluke45 dmm");

	//this will propperly have some options down the road
	this.serialPort = new SerialPort("/dev/ttyUSB0", {
		baudrate: 9600,
		parser: com.parsers.readline('\n', 'ascii')
	});

	this.serialPort.on('data', this.onData.bind(this));

	this.serialPort.on('open', debug.bind(null, "Connected to Fluke45!"));
};

util.inherits(Fluke45, EventEmitter);

Fluke45.prototype.onData = function(data) {

	this.emit('value', Number(data.toString()));
};