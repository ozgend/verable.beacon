const Crypto = require('crypto');

class Utilities {

    static uid(prefix, length) {
        return (prefix || '') + [...Array(length || 10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
    }

    static uuid(prefix, length) {
        return (prefix || '') + Crypto.randomBytes(length).toString('hex');
    }

}

module.exports = Utilities;