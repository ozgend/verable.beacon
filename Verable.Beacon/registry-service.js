var Utilities = require('./utilities');

var _registry = {};
var _registryIdMap = {};

class RegistryService {

    async discoverOne(serviceName) {
        return _registry[serviceName] || [];
    }

    async discoverAll() {
        return _registry;
    }

    async register(serviceDefinition) {
        if (!_registry[serviceDefinition.Name]) {
            _registry[serviceDefinition.Name] = [];
        }
        var uid = Utilities.uid('v-', 12);
        serviceDefinition.Uid = uid;
        _registry[serviceDefinition.Name].push(serviceDefinition);
        _registryIdMap[uid] = serviceDefinition.Name;
        return uid;
    }

    async deregister(uid) {
        if (_registryIdMap[uid]) {
            var serviceName = _registryIdMap[uid];
            delete _registry[serviceName];
            delete _registryIdMap[uid];
        }
        return uid;
    }

}

module.exports = RegistryService;