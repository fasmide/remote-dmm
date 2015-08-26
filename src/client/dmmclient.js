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

DmmClient.prototype.findReadingViewElements = function(readingView) {
	this.readingView = {};
	this.readingView.value = $('.value', readingView);
	this.readingView.min = $('.min', readingView);
	this.readingView.max = $('.max', readingView);
	this.readingView.avg = $('.avg', readingView);
	this.readingView.count = $('.count', readingView);
	this.readingView.vpp = $('.vpp', readingView);
	this.readingView.readssec = $('.readssec', readingView);
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

	if(digits > this.maxDigitsSeen) {
		debug("I have seen more digits! %s", digits);
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
				}
			],
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
					type : "spline",
					dataPoints : this.histogramValues
				}
			]
		});

	this.histogramChart.render();
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
	}

	if (this.min > value) {
		this.min = value;
	}

	if (this.max < value) {
		this.max = value;
	}

	this.total += value;

	this.avg = this.total/this.values.length;

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
};