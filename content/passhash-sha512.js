
b64_hmac_sha512 = require("../content/sha512crypt/sha512.js").b64_hmac_sha512;
sha512crypt = require("../content/sha512crypt/sha512crypt.js").sha512crypt;

function b64_crypt_sha512(key, data)
{
    var s = sha512crypt(key, data);
    var split_data = s.split("$");
    return split_data[3];
}

if (typeof exports !== 'undefined') {
  exports.b64_hmac_sha512 = b64_hmac_sha512;
  exports.b64_crypt_sha512 = b64_crypt_sha512;
}