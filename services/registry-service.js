const Helper = require('../utils/helper');
const Constants = require('../utils/constants');
const AsyncRedis = require('async-redis');
const redisClient = AsyncRedis.createClient();

redisClient.on('error', function(err) {
    console.log('redisClient' + err);
});

class RegistryService {

    async discoverOne(serviceName) {
        const serviceKey = Helper.buildKey(Constants.Keys.ServicePrefix, serviceName, Constants.Keys.Any);
        const serviceKeys = await redisClient.keys(serviceKey);
        let serviceDefinitionList = [];

        for (var i = 0; i < serviceKeys.length; i++) {
            const key = serviceKeys[i];
            const raw = await redisClient.get(key);
            serviceDefinitionList.push(JSON.parse(raw));
        }

        return serviceDefinitionList;
    }

    async discoverAll() {
        const serviceKey = Helper.buildKey(Constants.Keys.ServicePrefix, Constants.Keys.Any);
        const serviceKeys = await redisClient.keys(serviceKey);
        let serviceDefinitionList = [];

        for (var i = 0; i < serviceKeys.length; i++) {
            const key = serviceKeys[i];
            const raw = await redisClient.get(key);
            serviceDefinitionList.push(JSON.parse(raw));
        }

        let serviceDefinitions = serviceDefinitionList.reduce(function(set, current) {
            (set[current[Constants.Keys.HashName]] = set[current[Constants.Keys.HashName]] || []).push(current);
            return set;
        }, {});

        return serviceDefinitions;
    }

    async register(serviceDefinition) {
        const uid = Helper.uid('v-', 12);
        const serviceKey = Helper.buildKey(Constants.Keys.ServicePrefix, serviceDefinition.Name, uid);
        const mappingKey = Helper.buildKey(Constants.Keys.MappingPrefix, uid);

        serviceDefinition.Uid = uid;

        await redisClient.set(serviceKey, JSON.stringify(serviceDefinition));
        await redisClient.set(mappingKey, serviceDefinition.Name);

        return uid;
    }

    async deregister(uid) {
        const mappingKey = Helper.buildKey(Constants.Keys.MappingPrefix, uid);
        const serviceName = await redisClient.get(mappingKey);
        const serviceKey = Helper.buildKey(Constants.Keys.ServicePrefix, serviceName, uid);

        await redisClient.del(serviceKey);

        return uid;
    }

}

module.exports = RegistryService;