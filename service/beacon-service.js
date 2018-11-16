const Utilities = require('../utilities');
const Constants = require('../constants');
const RegistryService = require('./registry-service');

class BeaconService {
    constructor() {
        this.registryService = new RegistryService();
    }

    async processReceived(encoded) {
        var beaconData = this._unpack(encoded);
        var commandResult;

        switch (beaconData.command) {
            case Constants.Commands.DiscoverOne:
                commandResult = await this.registryService.discoverOne(beaconData.data);
                break;
            case Constants.Commands.DiscoverAll:
                commandResult = await this.registryService.discoverAll();
                break;
            case Constants.Commands.Register:
                commandResult = await this.registryService.register(beaconData.data);
                break;
            case Constants.Commands.Deregister:
                commandResult = await this.registryService.deregister(beaconData.data);
                break;
        }

        // console.log('[processReceived] %s -> %s', JSON.stringify(beaconData), commandResult);

        return commandResult;
    }

    async prepareSend(data) {
        // console.log('[prepareSend] -> %j', data);

        var encoded = this._pack(data);
        return encoded;
    }

    _pack(data, requireSerialization) {
        var stringified;
        var requireSerialization = !this._isPrimitive(data);

        if (requireSerialization) {
            stringified = JSON.stringify(data);
        } else {
            stringified = data;
        }

        var encoded = Buffer.from(stringified).toString('base64');
        return encoded;
    }

    _unpack(encoded) {
        var stringified = Buffer.from(encoded, 'base64').toString('ascii');
        stringified = Buffer.from(stringified, 'base64').toString('ascii');

        // var encodedBuffer = new Buffer(encoded.toString(), 'base64');
        // var stringified = encodedBuffer.toString('ascii');       

        var command = stringified.substr(Constants.Parser.CommandStartIndex, Constants.Parser.CommandLength);
        var serialized = parseInt(stringified.substr(Constants.Parser.SerializedStartIndex, Constants.Parser.SerializedLength)) == 1;
        var data = stringified.substr(Constants.Parser.DataStartIndex);

        var result = { command: command };

        if (serialized) {
            result.data = JSON.parse(data);
        } else {
            result.data = data;
        }
        return result;
    }

    _isPrimitive(value) {
        var type = typeof value;
        return value == null || (type != 'object' && type != 'function');
    }
}

module.exports = BeaconService;