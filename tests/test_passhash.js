#!/usr/bin/node

var assert = require('assert');
var PassHashCommon = require('../content/passhash-common.js').PassHashCommon;
var PassHashDialog = require('../content/passhash-dialog.js').PassHashDialog;

// global
b64_hmac_sha1 = require("../content/passhash-sha1.js").b64_hmac_sha1;
b64_hmac_sha512 = require("../content/passhash-sha512.js").b64_hmac_sha512;
b64_crypt_sha512 = require("../content/passhash-sha512.js").b64_crypt_sha512;


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

    test('generateHashWord sha512crypt', function() {
        var hash =  PassHashCommon.generateHashWord(
            'site', 'master', 14, true, true, true, false, false,'sha512crypt');
        assert.equal(hash, '(zozvaI1YFbDBJ');
    });
    
});

suite('PassHashDialog', function() {

    setup(function() {
        PassHashDialog.requireDigit = true;
        PassHashDialog.requirePunctuation = true;
        PassHashDialog.requireMixedCase = true;
        PassHashDialog.restrictSpecial = false;
        PassHashDialog.restrictDigits = false;
        PassHashDialog.hashWordSize = 8;
    });
    
    test('getOptionString', function() {
        var optStr = PassHashDialog.getOptionString()
        assert.equal(optStr, "dpm8");
    });

    test('parseOptionString', function() {
        PassHashDialog.parseOptionString("dpr12");
        assert.equal(PassHashDialog.requireDigit, true);
        assert.equal(PassHashDialog.requirePunctuation, true);
        assert.equal(PassHashDialog.requireMixedCase, false);
        assert.equal(PassHashDialog.restrictSpecial, true);
        assert.equal(PassHashDialog.restrictDigits, false);
        assert.equal(PassHashDialog.hashWordSize, 12);
        assert.equal(PassHashDialog.hashAlgorithm, "sha1");
    });

    test('parseOptionString sha512', function() {
        PassHashDialog.parseOptionString("dpr12/sha512");
        assert.equal(PassHashDialog.hashAlgorithm, "sha512");
    });

    test('getOptionString sha512', function() {
        PassHashDialog.hashAlgorihtm = "sha512";
        var options_string = PassHashDialog.getOptionString();
        assert.equal(options_string, "dpm8/sha512");
    });

    test('parseOptionString sha512', function() {
        PassHashDialog.parseOptionString("dpr12/sha512crypt");
        assert.equal(PassHashDialog.hashAlgorithm, "sha512crypt");
    });

    test('getOptionString sha512crypt', function() {
        PassHashDialog.hashAlgorihtm = "sha512crypt";
        var options_string = PassHashDialog.getOptionString();
        assert.equal(options_string, "dpm8/sha512crypt");
    });

});
