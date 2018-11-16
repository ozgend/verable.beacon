var Constants = {

    Port: 7001,

    Commands: {
        Register: 'REG',
        Deregister: 'DRG',
        DiscoverOne: 'DS1',
        DiscoverAll: 'DSA',
        Heartbeat: 'HRB'

    },

    // CMD|0|....
    Parser: {
        Seperator: '|',
        CommandLength: 3,
        SeperatorLength: 1,
        SerializedLength: 1,
        CommandStartIndex: 0,
        SerializedStartIndex: 4,
        DataStartIndex: 6
    },

    Keys: {
        Seperator: ':',
        ServicePrefix: 'service',
        MappingPrefix: 'mapping',
        Any: '*',
        HashName: 'Name'
    }

};

module.exports = Constants;