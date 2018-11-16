const Constants = require('./utils/constants');
const BeaconService = require('./services/beacon-service');
const netSocket = require('net');

var beaconService = new BeaconService();

function onListen() {
    console.log('listening on ', Constants.Port);
}

function onConnection(socket) {
    var clientEndpoint = socket.remoteAddress + ':' + socket.remotePort;

    // console.log('[%s] connected', clientEndpoint);

    socket.on('data', async function(data) {
        // console.log('[%s] -> %s', clientEndpoint, data);

        var processedResult = await beaconService.processReceived(data);
        if (processedResult && processedResult !== undefined) {
            var processedResponse = await beaconService.prepareSend(processedResult)
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
        console.log('[%s] error', clientEndpoint, err);
    });
};

netSocket.createServer(onConnection).listen(Constants.Port, onListen);