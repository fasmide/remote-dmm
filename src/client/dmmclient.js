var debug = require('debug')('dmm:DmmClient');

var DmmClient = module.exports = function(readingView, histogramView, trendView) {

	this.connect();

	this.findReadingViewElements(readingView);

	this.maxDigitsSeen = 0;

	this.max = 0;
	this.min = 0;

	this.avg = 0;
	this.total = 0;
	this.values = [];

	this.trendValues = [];


	this.hMax = 0;
	this.hMin = 0;
	this.histogramValues = [
		{y: 0}, {y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0},	{y: 0}
	];

	this.prepareTrendChart();
	this.prepareHistogramChart();

	this.readsPerSecCounter = 0;

	setInterval(function() {
		this.readingView.readssec.text(this.readsPerSecCounter);
		this.readsPerSecCounter = 0;
	}.bind(this), 1000);

};

DmmClient.prototype.connect = function() {
	var loc = window.location, new_uri;
	if (loc.protocol === "https:") {
	    new_uri = "wss:";
	} else {
	    new_uri = "ws:";
	}
	new_uri += "//" + loc.host;
	new_uri += loc.pathname + "/";

	this.socket = new WebSocket(new_uri);
	this.socket.onmessage = this.onMessage.bind(this);
	this.socket.onopen = this.onOpen.bind(this);

};

DmmClient.prototype.onDownload = function() {

	var dataToDownload = this.values.join("\n");

	document.location = 'data:Application/octet-stream,' +
		encodeURIComponent(dataToDownload);

};

DmmClient.prototype.findReadingViewElements = function(readingView) {
	this.readingView = {};
	this.readingView.value = $('.value', readingView);
	this.readingView.min = $('.min', readingView);
	this.readingView.max = $('.max', readingView);
	this.readingView.avg = $('.avg', readingView);
	this.readingView.count = $('.count', readingView);
	this.readingView.vpp = $('.vpp', readingView);
	this.readingView.readssec = $('.readssec', readingView);
	$('.exportBtn').on('click', this.onDownload.bind(this));
	console.log(this.readingView);
};

DmmClient.prototype.onMessage = function(msg) {
	//debug("We had a message: %j", msg);

	var data = JSON.parse(msg.data);

	if(data.type == "reading") {
		this.onReading(data.value);
	}
};

DmmClient.prototype.onOpen = function() {
	debug("We have connection!");
};

DmmClient.prototype.fixedValue = function(value) {
	var index = value.indexOf('.');
	var digits = value.length - (index+1);

	if(index !== -1 && digits > this.maxDigitsSeen) {
		debug("I have seen more digits! %s total, value: %s", digits, value);
		this.maxDigitsSeen = digits;
	}
	return parseFloat(value).toFixed(this.maxDigitsSeen);
};

DmmClient.prototype.prepareTrendChart = function() {
	this.trendChart = new CanvasJS.Chart("trendChartContainer", {
		title : {
			text : "Trend"
		},
		data : [{
			type : "spline",
			dataPoints : this.trendValues
		}],
		axisY:{
			includeZero: false  //try changing it to true
		}
	});

	this.trendChart.render();
};

DmmClient.prototype.prepareHistogramChart = function() {
	this.histogramChart = new CanvasJS.Chart("histogramChartContainer", {
		title : {
			text : "Histogram"
		},
		data : [{
				dataPoints : this.histogramValues
		}]
	});

	this.histogramChart.render();
};

DmmClient.prototype.addValueToHistogram = function(value) {

	var steps = (this.hMax-this.hMin)/(this.histogramValues.length-1);

	//to find the index we:
	var index = Math.floor((value-this.hMin)/steps);

	if (index < 0) {
		//we need rebuild of histogram
		this.rebuildHistogramValues();
		return;
	}
	if (index >= this.histogramValues.length) {
		//we need rebuild
		this.rebuildHistogramValues();
		return;
	}
	this.histogramValues[index].y++;

	this.lastReadingColored();
};
DmmClient.prototype.rebuildHistogramValues = function() {

	debug("Rebuilding histogram");

	this.hMin = this.min;
	this.hMax = this.max;

	var steps = (this.hMax-this.hMin)/(this.histogramValues.length-1);

	//reset values
	for (var i = this.histogramValues.length - 1; i >= 0; i--) {
		this.histogramValues[i].y = 0;
		this.histogramValues[i].label = (this.hMin + (steps*i)).toFixed(this.maxDigitsSeen);
		this.histogramValues[i].color = "#B0D0B0";
	};

	//count up
	for (var i = this.values.length - 1; i >= 0; i--) {
		var index = Math.floor((this.values[i]-this.hMin)/steps);
		this.histogramValues[index].y++;
	};

	this.lastReadingColored();

};

DmmClient.prototype.lastReadingColored = function() {
	var steps = (this.hMax-this.hMin)/(this.histogramValues.length-1);
	var index = Math.floor((this.values[this.values.length-1]-this.hMin)/steps);

	for (var i = this.histogramValues.length - 1; i >= 0; i--) {
		this.histogramValues[i].color = "#B0D0B0";
	};
	this.histogramValues[index].color = "#1E90FF";
};
DmmClient.prototype.recordValue = function(value) {
	value = parseFloat(value);

	this.values.push(value);

	//for graphing
	this.trendValues.push({y: value});

	if (this.values.length == 1) {
		//First reading!
		this.min = value;
		this.max = value;
		this.avg = value;
		this.total = value;
	} else {
		this.total += value;

		this.avg = this.total/this.values.length;

	}

	if (this.min > value) {
		this.min = value;
	}

	if (this.max < value) {
		this.max = value;
	}

	//for histogram
	this.addValueToHistogram(value);


	this.readsPerSecCounter++;

};

DmmClient.prototype.onReading = function(reading) {
	this.recordValue(reading);

	this.readingView.value.text(this.fixedValue(reading));
	this.readingView.min.text(this.min.toFixed(this.maxDigitsSeen));
	this.readingView.max.text(this.max.toFixed(this.maxDigitsSeen));
	this.readingView.avg.text(this.avg.toFixed(this.maxDigitsSeen));
	this.readingView.count.text(this.values.length);
	this.readingView.vpp.text((this.max-this.min).toFixed(this.maxDigitsSeen));

	this.trendChart.render();
	this.histogramChart.render();
};