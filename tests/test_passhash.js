#!/usr/bin/node

var assert = require('assert');
var PassHashCommon = require('../content/passhash-common.js').PassHashCommon;
var PassHashDialog = require('../content/passhash-dialog.js').PassHashDialog;

// global
b64_hmac_sha1 = require("../content/passhash-sha1.js").b64_hmac_sha1;
b64_hmac_sha512 = require("../content/passhash-sha512.js").b64_hmac_sha512;


suite('PassHashCommon', function() {

    test('generateHashWord sha1', function() {
        var hash =  PassHashCommon.generateHashWord(
            'site', 'master', 14, true, true, true, false, false, 'sha1');
        assert.equal(hash, ',n/pRqqn4rwKvb');
    });

    test('generateHashWord sha512', function() {
        var hash =  PassHashCommon.generateHashWord(
            'site', 'master', 14, true, true, true, false, false, 'sha512');
        assert.equal(hash, 'xvOxv4L!fxqBFD');
    });
    
});

suite('PassHashDialog', function() {

    test('getOptionString', function() {
        PassHashDialog.requireDigit = true;
        PassHashDialog.requirePunctuation = true;
        PassHashDialog.requireMixedCase = true;
        PassHashDialog.restrictSpecial = false;
        PassHashDialog.restrictDigits = false;
        PassHashDialog.hashWordSize = 10;

        var optStr = PassHashDialog.getOptionString()
        assert.equal(optStr, "dpm10");
    });

    test('parseOptionString', function() {
        PassHashDialog.parseOptionString("dpr12");
        assert.equal(PassHashDialog.requireDigit, true);
        assert.equal(PassHashDialog.requirePunctuation, true);
        assert.equal(PassHashDialog.requireMixedCase, false);
        assert.equal(PassHashDialog.restrictSpecial, true);
        assert.equal(PassHashDialog.restrictDigits, false);
        assert.equal(PassHashDialog.hashWordSize, 12);
    });

});
