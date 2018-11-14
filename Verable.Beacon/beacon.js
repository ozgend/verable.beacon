var ServiceRegistry = {};

var ParserConstants = {
    // CMD|0|....
    Seperator: '|',
    CommandLength: 3,
    SeperatorLength: 1,
    SerializedLength: 1,
    CommandStartIndex: 0,
    SerializedStartIndex: 4,
    DataStartIndex: 6,
}

function isPrimitive(value) {
    var type = typeof value;
    return value == null || (type != 'object' && type != 'function');
}

var Beacon = {

    _commandMap: {
        'REG': '_register',
        'DRG': '_deregister',
        'LST': '_list',
        'HRB': '_heartbeat'
    },

    processReceived: function(encoded) {
        var result = Beacon.unpack(encoded);
        var commandFunctionName = Beacon._commandMap[result.command];
        var commandFunction = Beacon[commandFunctionName];
        var response = commandFunction(result.data);
        return response;
    },

    prepareSend: function(data) {
        var requireSerialzation = !isPrimitive(data);
        var encoded = Beacon.pack(data, requireSerialzation);
        return encoded;
    },

    pack: function(data, requireSerialzation) {
        var stringified;

        if (requireSerialzation) {
            stringified = JSON.stringify(data);
        } else {
            stringified = data;
        }

        var encoded = Buffer.from(stringified).toString('base64');
        return encoded;
    },

    unpack: function(encoded) {
        var stringified = Buffer.from(encoded, 'base64').toString('ascii');
        stringified = Buffer.from(stringified, 'base64').toString('ascii')
        var command = stringified.substr(ParserConstants.CommandStartIndex, ParserConstants.CommandLength);
        var serialized = parseInt(stringified.substr(ParserConstants.SerializedStartIndex, ParserConstants.SerializedLength)) == 1;
        var data = stringified.substr(ParserConstants.DataStartIndex);

        var result = { command: command };

        if (serialized) {
            result.data = JSON.parse(data);
        } else {
            result.data = data;
        }
        return result;
    },

    _register: function(serviceDefinition) {
        if (!ServiceRegistry[serviceDefinition.Name]) {
            ServiceRegistry[serviceDefinition.Name] = [];
        }
        ServiceRegistry[serviceDefinition.Name].push(serviceDefinition);
    },

    _deregister: function(serviceDefinition) {
        // if (ServiceRegistry[serviceDefinition.Name]) {
        //     delete ServiceRegistry[serviceDefinition.Name]; && serviceDefinition.Endpoint
        // }
    },

    _list: function(serviceName) {
        return ServiceRegistry[serviceName] || [];
    }
};

module.exports = Beacon;