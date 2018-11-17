var expect = require('chai').expect;
var BeaconService = require('../services/beacon-service');
var Helper = require('../utils/helper');
var Constants = require('../utils/constants');
var beaconService = new BeaconService();


Object.prototype.keySize = function () {
    var size = 0, key;
    for (key in this) {
        if (this.hasOwnProperty(key)) size++;
    }
    return size;
};

describe('_pack()', function () {
    it('should pack given object', function () {
        var data = { a: 1, b: true };
        var encoded = beaconService._pack(data, true);
        var expected = Buffer.from(JSON.stringify(data)).toString('base64');
        expect(encoded).to.be.equal(expected);
    });

    it('should pack given value', function () {
        var data = "123456";
        var encoded = beaconService._pack(data);
        var expected = Buffer.from(data).toString('base64');
        expect(encoded).to.be.equal(expected);
    });
});

describe('_unpack()', function () {
    it('should unpack given object', function () {
        var raw = "UkVHfDF8eyJFbmRwb2ludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6OTkwMSIsIk5hbWUiOiJub2RlanMtYmFja2VuZCIsIlZlcnNpb24iOiIxLjAifQ==";
        var buffer = Buffer.from(raw, "ascii");
        var unpacked = beaconService._unpack(buffer);
        expect(unpacked.command).to.be.equal("REG");
        expect(unpacked.serialized).to.be.equal(true);
        expect(unpacked.data.Name).to.be.equal("nodejs-backend");
    });

    it('should unpack given value', function () {
        var raw = "RFMxfDB8bm9kZWpzLWJhY2tlbmQ=";
        var buffer = Buffer.from(raw, "ascii");
        var unpacked = beaconService._unpack(buffer);
        expect(unpacked.command).to.be.equal("DS1");
        expect(unpacked.serialized).to.be.equal(false);
        expect(unpacked.data).to.be.equal("nodejs-backend");
    });
});

describe('uid()', function () {
    it('should generate random', function () {
        var ids = {};
        var max = 1000
        for (var i = 0; i < 1000; i++) {
            ids[Helper.uid("v-", 20)] = i;
        }
        expect(ids.keySize()).to.be.equal(max);
    });
});

describe('uuid()', function () {
    it('should generate random', function () {
        var ids = {};
        var max = 1000
        for (var i = 0; i < 1000; i++) {
            ids[Helper.uuid("v-", 20)] = i;
        }
        expect(ids.keySize()).to.be.equal(max);
    });
});

describe('isPrimitive()', function () {
    it('should check value', function () {
        expect(Helper.isPrimitive(1)).to.be.equal(true);
        expect(Helper.isPrimitive('')).to.be.equal(true);
        expect(Helper.isPrimitive('a')).to.be.equal(true);
        expect(Helper.isPrimitive(['a', 'b'])).to.be.equal(false);
        expect(Helper.isPrimitive({})).to.be.equal(false);
        expect(Helper.isPrimitive({ a: 1 })).to.be.equal(false);
    });
});

describe('buildKey()', function () {
    it('should build key', function () {
        var expected = 'service:applicationName:sub1:sub2';
        var key = Helper.buildKey(Constants.Keys.ServicePrefix, 'applicationName', 'sub1', 'sub2')
        expect(key).to.be.equal(expected);
    });
});