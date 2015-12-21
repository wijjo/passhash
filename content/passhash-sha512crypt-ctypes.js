
Components.utils.import("resource://gre/modules/ctypes.jsm");

function b64_sha512crypt_native(key, salt)
{
    return _native_crypt(key, "$6$"+salt);
}

function _native_crypt(js_key, js_salt)
{
    // convert the inputs
    var key = ctypes.char.array()(js_key);
    var salt = ctypes.char.array()(js_salt);

    // declare what we need
    var lib = ctypes.open("libcrypt.so.1");
    var native_crypt = lib.declare("crypt",
                                   ctypes.default_abi,
                                   ctypes.char.ptr, /* return value */
                                   ctypes.char.ptr, /* key */
                                   ctypes.char.ptr /* salt */
                                  );
    // call the native code
    var raw_result = native_crypt(key, salt);
    lib.close();

    // convert the output from char* to a js string
    var result = raw_result.readString();

    // cut of the leading: salt + "$"
    var prefix_len = js_salt.length+1
    return result.substr(prefix_len, result.length - prefix_len);
}
