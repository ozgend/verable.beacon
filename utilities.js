const Constants = require('./constants');
const Crypto = require('crypto');

class Utilities {

    static uid(prefix, length) {
        return (prefix || '') + [...Array(length || 10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
    }

    static uuid(prefix, length) {
        return (prefix || '') + Crypto.randomBytes(length).toString('hex');
    }

    static buildKey(prefix, ...sub) {
        var key = prefix;
        if (sub && sub.length > 0) {
            key += Constants.Keys.Seperator + sub.join(Constants.Keys.Seperator);
        }
        return key;
    }
}

module.exports = Utilities;