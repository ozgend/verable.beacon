const host = '127.0.0.1';
const port = 7001;

var beacon = require('./beacon');
var verableBeaconServer = require('net').createServer(onConnection);

verableBeaconServer.listen(port, onListen);

function onListen() {
    console.log('listening', verableBeaconServer.address());
}

function onConnection(socket) {
    var clientEndpoint = socket.remoteAddress + ':' + socket.remotePort;

    // console.log('[%s] connected', clientEndpoint);

    socket.on('data', function(data) {
        // console.log('[%s] -> %s', clientEndpoint, data);
        var processedResult = beacon.processReceived(data);
        if (processedResult && processedResult !== undefined) {
            var processedResponse = beacon.prepareSend(processedResult)
            socket.write(processedResponse);
        }
        socket.end();
    });

    socket.on('end', function() {
        // console.log('[%s] end', clientEndpoint);
    });

    socket.on('close', function() {
        // console.log('[%s] closed', clientEndpoint);
    });

    socket.on('error', function(err) {
        console.log('[%s] error', clientEndpoint, err.message);
    });
};