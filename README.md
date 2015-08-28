# Remote Multimeter

Webbased remote interface for various digital multimeters, allows the user to share readings live and gives the local user some additions to otherwise dump dmm's like live statistics and charts. Highlights:

  - Live reading display, including some basic statistics.
  - Trend chart
  - Histogram
  - Export readings in CSV format
  - Up to 1000's of viewers (i guess :)

![Screenshot](https://github.com/fasmide/remote-dmm/blob/master/docs/2015-08-28-231523_1280x1024_scrot.png?raw=true)

Ive had the thing running for some hours up to about 40k readings while still having usable performance on my 2007 vintage laptop, if left for days it will properly crash the browser at some point.

## Running

You will need nodejs and npm to install dependencies and to run the webserver.

1. $ git clone https://github.com/fasmide/remote-dmm.git && cd remote-dmm
2. $ npm install
3. $ DEBUG=* DMM=fluke45 bin/www
4. Visit http://localhost:3000

The fluke45 module assumes a serial tty at `/dev/ttyUSB0` at 9600 baudrate 8 N 1. There are currently no way of changing these defaults but to edit the `/src/dmms/fluke45.js`file directly. TODO

## Supported DMMs

- Fluke 45 bench meter (the meter must be put in print mode)
- Dummy (for development)

Yeah thats not too impressing yet, i do have a ut61e laying around and I'll get to it some day :)

You are very welcome to add support for more DMMs! Its simple, the modules only need to implement EventEmitter and `emit` values when ever they have a new reading, read on.

## Developing
remote-dmm uses browserify to build a bundle.js file, install both browserify and watchify to have it rebuild the bundle as you go:

`~/remote-dmm$ watchify src/client/* -o public/javascripts/bundle.js -v`

DMM modules are located in `~/src/dmms/` these should accept a options object (thats not used yet) in its constructor, and otherwise just `emit('value', Number)` whenever there is a new reading available.

## License
MIT