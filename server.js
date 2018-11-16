const port = 7001;
const BeaconService = require('./beacon-service');
var beaconService = new BeaconService();

var server = require('net').createServer(onConnection);
server.listen(port, onListen);

function onListen() {
    console.log('listening', server.address());
}

function onConnection(socket) {
    var clientEndpoint = socket.remoteAddress + ':' + socket.remotePort;

    // console.log('[%s] connected', clientEndpoint);

    socket.on('data', async function (data) {
        // console.log('[%s] -> %s', clientEndpoint, data);

        var processedResult = await beaconService.processReceived(data);
        if (processedResult && processedResult !== undefined) {
            var processedResponse = await beaconService.prepareSend(processedResult)
            socket.write(processedResponse);
        }
        socket.end();
    });

    socket.on('end', function () {
        // console.log('[%s] end', clientEndpoint);
    });

    socket.on('close', function () {
        // console.log('[%s] closed', clientEndpoint);
    });

    socket.on('error', function (err) {
        console.log('[%s] error', clientEndpoint, err);
    });
};