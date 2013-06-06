#!/usr/bin/node

var assert = require('assert');
var PassHashCommon = require('../content/passhash-common.js');

// global
b64_hmac_sha1 = require("../content/passhash-sha1.js").b64_hmac_sha1;
b64_hmac_sha512 = require("../content/passhash-sha512.js").b64_hmac_sha512;


suite('PassHashCommon', function() {

    test('generateHashWord sha1', function() {
        var hash =  PassHashCommon.PassHashCommon.generateHashWord(
            'site', 'master', 14, true, true, true, false, false, 'sha1');
        assert.equal(hash, ',n/pRqqn4rwKvb');
    });

    test('generateHashWord sha512', function() {
        var hash =  PassHashCommon.PassHashCommon.generateHashWord(
            'site', 'master', 14, true, true, true, false, false, 'sha512');
        assert.equal(hash, 'xvOxv4L!fxqBFD');
    });
    
});

