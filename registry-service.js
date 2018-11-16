const Utilities = require('./utilities');
const AsyncRedis = require('async-redis');
const redisClient = AsyncRedis.createClient();

redisClient.on('error', function (err) {
    console.log('redisClient' + err);
});

class RegistryService {

    async discoverOne(serviceName) {
        var serviceDefinitionList = [];

        var serviceKey = 'service:' + serviceName + ':*';
        var serviceKeys = await redisClient.keys(serviceKey);

        await serviceKeys.forEach(async key => {
            var raw = await redisClient.get(key);
            serviceDefinitionList.push(JSON.parse(raw));
        });

        return serviceDefinitionList;
    }

    async discoverAll() {
        return {};
    }

    async register(serviceDefinition) {

        var uid = Utilities.uid('v-', 12);
        serviceDefinition.Uid = uid;

        var serviceKey = 'service:' + serviceDefinition.Name + ':' + uid;
        var mappingKey = 'mapping:' + uid;

        await redisClient.set(serviceKey, JSON.stringify(serviceDefinition));
        await redisClient.set(mappingKey, serviceDefinition.Name);

        return uid;
    }

    async deregister(uid) {

        var mappingKey = 'idmapping:' + uid;
        var serviceName = await redisClient.get(mappingKey);
        var serviceKey = 'service:' + serviceName + ':' + uid;

        await redisClient.del(serviceKey);

        return uid;
    }

}

module.exports = RegistryService;