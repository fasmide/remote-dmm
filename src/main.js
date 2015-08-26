var DmmClient = require('./dmmclient'),
	myDebug = require('debug').enable('*'),
	debug = require('debug')('dmm:main');

debug('Creating DmmClient...');
var dmmClient = new DmmClient(
	$('#reading'),
	$('#histogram'),
	$('#trend')
);