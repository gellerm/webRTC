var fs = require('fs');
var static = require('node-static');
var http = require('https');
// Create a node-static server instance
var file = new(static.Server)();
var options = {
    key: fs.readFileSync('/root/dev/videoHelp/webRTC/js/keys/webrtckey.pem'),
    cert: fs.readFileSync('/root/dev/videoHelp/webRTC/js/keys/webrtc.crt')
};

// We use the http module’s createServer function and
// rely on our instance of node-static to serve the files
var app = http.createServer(options, function (req, res) {
  file.serve(req, res);
}).listen(8181);

// Use socket.io JavaScript library for real-time web applications
var io = require('socket.io').listen(app);

console.log('Starting server...');
// Let's start managing connections...
io.sockets.on('connection', function (socket){
    console.log("received connection");

        // Handle 'message' messages
    socket.on('message', function (message) {
        log('S --> got message: ', message);
        // channel-only broadcast...
        console.log('Received message \'' + message + '\'');
//        socket.broadcast.to(message.channel).emit('message', message);
        socket.broadcast.emit('message', message);        
    });

    // Handle 'create or join' messages
    socket.on('create or join', function (room) {
        var numClients = 0;

        var theRoom = io.sockets.adapter.rooms[room]; 
        if (typeof theRoom === "object") {
        	numClients = Object.keys(theRoom).length;
        }

        log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
        log('S --> Request to create or join room', room);
	console.log("room = " + theRoom + " numClients = " + numClients);

        // First client joining...
        if (numClients == 0){
            socket.join(room);
            socket.emit('created', room);
            console.log('Created room ' + room)
        } else if (numClients == 2) {
        // Second client joining...
            io.sockets.in(room).emit('join', room);
            console.log('before join ' + room);
            socket.join(room);
            console.log('after join ' + room);
            socket.emit('joined', room);
            console.log('after joined ' + room);
        } else { // max two clients
            socket.emit('full', room);
            console.log('Room is full ' + room)
        }
    });

    function log(){
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
                array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
});
