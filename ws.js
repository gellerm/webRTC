var fs = require('fs');
var static = require('node-static');
var port = 8180;
 
var fileServer = new(static.Server)();

var options = {
    key: fs.readFileSync('/root/dev/videoHelp/webRTC/keys/key.pem'),
    cert: fs.readFileSync('/root/dev/videoHelp/webRTC/keys/cert.pem')
};


require('https').createServer(options, function (request, response) {
	request.addListener('end', function () {
		console.log("Serving file: " + request);
		fileServer.serve(request, response);
	    }).resume();
    }).listen(port);

console.log("https server listening on port: " + port);