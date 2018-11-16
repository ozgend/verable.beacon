const Crypto = require('crypto');

var Utilities = {

    uid: function (prefix, length) {
        return (prefix || '') + [...Array(length || 10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
    },

    uuid: function (prefix, length) {
        return (prefix || '') + Crypto.randomBytes(length).toString('hex');
    }

}

module.exports = Utilities;