/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Password Hasher
 *
 * The Initial Developer of the Original Code is Steve Cooper.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): (none)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var PassHashCommon =
{
    // Artificial host name used for for saving to the password database
    host: "passhash.passhash",

    log: function(msg)
    {
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                .getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage(msg);
    },

    loadOptions: function()
    {
        var opts = this.createOptions();
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService).getBranch("passhash.");
        var forceSave = false;
        if (prefs.prefHasUserValue("optSecurityLevel"))
        {
            opts.securityLevel = prefs.getIntPref("optSecurityLevel");
            opts.firstTime = false;
            forceSave = true;
        }
        if (prefs.prefHasUserValue("optGuessSiteTag"))
            opts.guessSiteTag = prefs.getBoolPref("optGuessSiteTag");
        if (prefs.prefHasUserValue("optRememberSiteTag"))
            opts.rememberSiteTag = prefs.getBoolPref("optRememberSiteTag");
        if (prefs.prefHasUserValue("optRememberMasterKey"))
            opts.rememberMasterKey = prefs.getBoolPref("optRememberMasterKey");
        if (prefs.prefHasUserValue("optRevealSiteTag"))
            opts.revealSiteTag = prefs.getBoolPref("optRevealSiteTag");
        if (prefs.prefHasUserValue("optRevealHashWord"))
            opts.revealHashWord = prefs.getBoolPref("optRevealHashWord");
        if (prefs.prefHasUserValue("optShowMarker"))
            opts.showMarker = prefs.getBoolPref("optShowMarker");
        if (prefs.prefHasUserValue("optUnmaskMarker"))
            opts.unmaskMarker = prefs.getBoolPref("optUnmaskMarker");
        if (prefs.prefHasUserValue("optGuessFullDomain"))
            opts.guessFullDomain = prefs.getBoolPref("optGuessFullDomain");
        if (prefs.prefHasUserValue("optDigitDefault"))
            opts.digitDefault = prefs.getBoolPref("optDigitDefault");
        if (prefs.prefHasUserValue("optPunctuationDefault"))
            opts.punctuationDefault = prefs.getBoolPref("optPunctuationDefault");
        if (prefs.prefHasUserValue("optMixedCaseDefault"))
            opts.mixedCaseDefault = prefs.getBoolPref("optMixedCaseDefault");
        if (prefs.prefHasUserValue("optHashWordSizeDefault"))
            opts.hashWordSizeDefault = prefs.getIntPref("optHashWordSizeDefault");
        if (prefs.prefHasUserValue("optShortcutKeyCode"))
            opts.shortcutKeyCode = prefs.getCharPref("optShortcutKeyCode");
        if (!opts.shortcutKeyCode)
        {
            // Set shortcut key to XUL-defined default.
            forceSave = true;
            var elementKey = document.getElementById("key_passhash");
            if (elementKey != null)
            {
                opts.shortcutKeyCode = elementKey.getAttribute("key");
                if (!opts.shortcutKeyCode)
                    opts.shortcutKeyCode = elementKey.getAttribute("keycode");
            }
        }
        if (prefs.prefHasUserValue("optShortcutKeyMods"))
            opts.shortcutKeyMods = prefs.getCharPref("optShortcutKeyMods");
        if (!opts.shortcutKeyMods)
        {
            // Set shortcut modifiers to XUL-defined default.
            forceSave = true;
            var elementKey = document.getElementById("key_passhash");
            if (elementKey != null)
                opts.shortcutKeyMods = elementKey.getAttribute("modifiers");
        }
        // Force saving options if the key options are not present to give them visibility
        if (forceSave)
            this.saveOptions(opts);
        return opts;
    },

    createOptions: function()
    {
        var opts = new Object();
        opts.securityLevel       = 2;
        opts.guessSiteTag        = true;
        opts.rememberSiteTag     = true;
        opts.rememberMasterKey   = false;
        opts.revealSiteTag       = true;
        opts.revealHashWord      = false;
        opts.showMarker          = true;
        opts.unmaskMarker        = false;
        opts.guessFullDomain     = false;
        opts.digitDefault        = true;
        opts.punctuationDefault  = true;
        opts.mixedCaseDefault    = true;
        opts.hashWordSizeDefault = 8;
        opts.firstTime           = true;
        opts.shortcutKeyCode     = "";
        opts.shortcutKeyMods     = "";
        return opts;
    },

    saveOptions: function(opts)
    {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService).getBranch("passhash.");
        prefs.setIntPref( "optSecurityLevel",       opts.securityLevel);
        prefs.setBoolPref("optGuessSiteTag",        opts.guessSiteTag);
        prefs.setBoolPref("optRememberSiteTag",     opts.rememberSiteTag);
        prefs.setBoolPref("optRememberMasterKey",   opts.rememberMasterKey);
        prefs.setBoolPref("optRevealSiteTag",       opts.revealSiteTag);
        prefs.setBoolPref("optRevealHashWord",      opts.revealHashWord);
        prefs.setBoolPref("optShowMarker",          opts.showMarker);
        prefs.setBoolPref("optUnmaskMarker",        opts.unmaskMarker);
        prefs.setBoolPref("optGuessFullDomain",     opts.guessFullDomain);
        prefs.setBoolPref("optDigitDefault",        opts.digitDefault);
        prefs.setBoolPref("optPunctuationDefault",  opts.punctuationDefault);
        prefs.setBoolPref("optMixedCaseDefault",    opts.mixedCaseDefault);
        prefs.setIntPref( "optHashWordSizeDefault", opts.hashWordSizeDefault);
        prefs.setCharPref("optShortcutKeyCode",     opts.shortcutKeyCode);
        prefs.setCharPref("optShortcutKeyMods",     opts.shortcutKeyMods);
    },

    loadSecureValue: function(option, name, suffix, valueDefault)
    {
        return (this.hasLoginManager()
                    ? this.loadLoginManagerValue(option, name, suffix, valueDefault)
                    : this.loadPasswordManagerValue(option, name, suffix, valueDefault));
    },

    loadLoginManagerValue: function(option, name, suffix, valueDefault)
    {
        var user = (suffix ? name + "-" + suffix : name);
        var value = valueDefault;
        if (option && suffix != null)
        {
            var login = this.findLoginManagerUserLogin(user);
            if (login != null && login.password != "" && login.password != "n/a")
                value = login.password;
        }
        return value;
    },

    loadPasswordManagerValue: function(option, name, suffix, valueDefault)
    {
        var user = (suffix ? name + "-" + suffix : name);
        var value = valueDefault;
        var found = false;
        if (option && suffix != null)
        {
            var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                            .getService(Components.interfaces.nsIPasswordManager);
            var e = passwordManager.enumerator;
            while (!found && e.hasMoreElements())
            {
                try
                {
                    var pass = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
                    if (pass.host == this.host && pass.user == user)
                    {
                         value = pass.password;
                         found = true;
                    }
                }
                catch (ex) {}
            }
        }
        return value;
    },

    saveSecureValue: function(option, name, suffix, value)
    {
        return (this.hasLoginManager()
                    ? this.saveLoginManagerValue(option, name, suffix, value)
                    : this.savePasswordManagerValue(option, name, suffix, value));
    },

    saveLoginManagerValue: function(option, name, suffix, value)
    {
        if (!value || suffix == null)
            return false;
        var valueSave = (option ? value : "n/a");
        var user = (suffix ? name + "-" + suffix : name);

        var loginManager = Components.classes["@mozilla.org/login-manager;1"].
                                getService(Components.interfaces.nsILoginManager);

        var newLogin = Components.classes["@mozilla.org/login-manager/loginInfo;1"].
                                createInstance(Components.interfaces.nsILoginInfo);

        newLogin.init(this.host, 'passhash', null, user, valueSave, "", "");

        var currentLogin = this.findLoginManagerUserLogin(user);

        if ( currentLogin == null)
            loginManager.addLogin(newLogin);
        else
            loginManager.modifyLogin(currentLogin, newLogin);
        return true;
    },

    savePasswordManagerValue: function(option, name, suffix, value)
    {
        if (!value || suffix == null)
            return false;
        var valueSave = (option ? value : "");
        var user = (suffix ? name + "-" + suffix : name);
        var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"]
                                        .getService(Components.interfaces.nsIPasswordManager);
        try
        {
            // Firefox 2 seems to lose info from subsequent addUser calls
            // addUser on an existing host/user after restarting.
            passwordManager.removeUser(this.host, user);
        }
        catch (ex) {}
        passwordManager.addUser(this.host, user, valueSave);
        return true;
    },

    hasLoginManager: function()
    {
        return ("@mozilla.org/login-manager;1" in Components.classes);
    },

    findLoginManagerUserLogin: function(user)
    {
        // Find user from returned array of nsILoginInfo objects
        var logins = this.findAllLoginManagerLogins();
        for (var i = 0; i < logins.length; i++)
            if (logins[i].username == user)
                return logins[i];
        return null;
    },

    findAllLoginManagerLogins: function()
    {
        var loginManager = Components.classes["@mozilla.org/login-manager;1"].
                                getService(Components.interfaces.nsILoginManager);
        return loginManager.findLogins({}, this.host, "passhash", null);
    },

    // TODO: There's probably a better way
    getDomain: function(input)
    {
        var h = input.host.split(".");
        if (h.length <= 1)
            return null;
        // Handle domains like co.uk
        if (h.length > 2 && h[h.length-1].length == 2 && h[h.length-2] == "co")
            return h[h.length-3] + '.' + h[h.length-2] + '.' + h[h.length-1];
        return h[h.length-2] + '.' + h[h.length-1];
    },

    // IMPORTANT: This function should be changed carefully.  It must be
    // completely deterministic and consistent between releases.  Otherwise
    // users would be forced to update their passwords.  In other words, the
    // algorithm must always be backward-compatible.  It's only acceptable to
    // violate backward compatibility when new options are used.
    // SECURITY: The optional adjustments are positioned and calculated based
    // on the sum of all character codes in the raw hash string.  So it becomes
    // far more difficult to guess the injected special characters without
    // knowing the master key.
    // TODO: Is it ok to assume ASCII is ok for adjustments?
    generateHashWord: function(
                siteTag,
                masterKey,
                hashWordSize,
                requireDigit,
                requirePunctuation,
                requireMixedCase,
                restrictSpecial,
                restrictDigits)
    {
        // Start with the SHA1-encrypted master key/site tag.
        var s = b64_hmac_sha1(masterKey, siteTag);
        // Use the checksum of all characters as a pseudo-randomizing seed to
        // avoid making the injected characters easy to guess.  Note that it
        // isn't random in the sense of not being deterministic (i.e.
        // repeatable).  Must share the same seed between all injected
        // characters so that they are guaranteed unique positions based on
        // their offsets.
        var sum = 0;
        for (var i = 0; i < s.length; i++)
            sum += s.charCodeAt(i);
        // Restrict digits just does a mod 10 of all the characters
        if (restrictDigits)
            s = PassHashCommon.convertToDigits(s, sum, hashWordSize);
        else
        {
            // Inject digit, punctuation, and mixed case as needed.
            if (requireDigit)
                s = PassHashCommon.injectSpecialCharacter(s, 0, 4, sum, hashWordSize, 48, 10);
            if (requirePunctuation && !restrictSpecial)
                s = PassHashCommon.injectSpecialCharacter(s, 1, 4, sum, hashWordSize, 33, 15);
            if (requireMixedCase)
            {
                s = PassHashCommon.injectSpecialCharacter(s, 2, 4, sum, hashWordSize, 65, 26);
                s = PassHashCommon.injectSpecialCharacter(s, 3, 4, sum, hashWordSize, 97, 26);
            }
            // Strip out special characters as needed.
            if (restrictSpecial)
                s = PassHashCommon.removeSpecialCharacters(s, sum, hashWordSize);
        }
        // Trim it to size.
        return s.substr(0, hashWordSize);
    },

    // This is a very specialized method to inject a character chosen from a
    // range of character codes into a block at the front of a string if one of
    // those characters is not already present.
    // Parameters:
    //  sInput   = input string
    //  offset   = offset for position of injected character
    //  reserved = # of offsets reserved for special characters
    //  seed     = seed for pseudo-randomizing the position and injected character
    //  lenOut   = length of head of string that will eventually survive truncation.
    //  cStart   = character code for first valid injected character.
    //  cNum     = number of valid character codes starting from cStart.
    injectSpecialCharacter: function(sInput, offset, reserved, seed, lenOut, cStart, cNum)
    {
        var pos0 = seed % lenOut;
        var pos = (pos0 + offset) % lenOut;
        // Check if a qualified character is already present
        // Write the loop so that the reserved block is ignored.
        for (var i = 0; i < lenOut - reserved; i++)
        {
            var i2 = (pos0 + reserved + i) % lenOut
            var c = sInput.charCodeAt(i2);
            if (c >= cStart && c < cStart + cNum)
                return sInput;  // Already present - nothing to do
        }
        var sHead   = (pos > 0 ? sInput.substring(0, pos) : "");
        var sInject = String.fromCharCode(((seed + sInput.charCodeAt(pos)) % cNum) + cStart);
        var sTail   = (pos + 1 < sInput.length ? sInput.substring(pos+1, sInput.length) : "");
        return (sHead + sInject + sTail);
    },

    // Another specialized method to replace a class of character, e.g.
    // punctuation, with plain letters and numbers.
    // Parameters:
    //  sInput = input string
    //  seed   = seed for pseudo-randomizing the position and injected character
    //  lenOut = length of head of string that will eventually survive truncation.
    removeSpecialCharacters: function(sInput, seed, lenOut)
    {
        var s = '';
        var i = 0;
        while (i < lenOut)
        {
            var j = sInput.substring(i).search(/[^a-z0-9]/i);
            if (j < 0)
                break;
            if (j > 0)
                s += sInput.substring(i, i + j);
            s += String.fromCharCode((seed + i) % 26 + 65);
            i += (j + 1);
        }
        if (i < sInput.length)
            s += sInput.substring(i);
        return s;
    },

    // Convert input string to digits-only.
    // Parameters:
    //  sInput = input string
    //  seed   = seed for pseudo-randomizing the position and injected character
    //  lenOut = length of head of string that will eventually survive truncation.
    convertToDigits: function(sInput, seed, lenOut)
    {
        var s = '';
        var i = 0;
        while (i < lenOut)
        {
            var j = sInput.substring(i).search(/[^0-9]/i);
            if (j < 0)
                break;
            if (j > 0)
                s += sInput.substring(i, i + j);
            s += String.fromCharCode((seed + sInput.charCodeAt(i)) % 10 + 48);
            i += (j + 1);
        }
        if (i < sInput.length)
            s += sInput.substring(i);
        return s;
    },

    bumpSiteTag: function(siteTag)
    {
        var tag = siteTag.replace(/^[ \t]*(.*)[ \t]*$/, "$1");    // redundant
        if (tag)
        {
            var splitTag = tag.match(/^(.*):([0-9]+)?$/);
            if (splitTag == null || splitTag.length < 3)
                tag += ":1";
            else
                tag = splitTag[1] + ":" + (parseInt(splitTag[2]) + 1);
        }
        return tag;
    },

    // Returns true if an HTML node is some kind of text field.
    isTextNode: function(node)
    {
        try
        {
            var name = node.localName.toUpperCase();
            if (name == "TEXTAREA" || name == "TEXTBOX" ||
                        (name == "INPUT" &&
                            (node.type == "text" || node.type == "password")))
                return true;
        }
        catch(e) {}
        return false;
    },

    // From Mozilla utilityOverlay.js
    // TODO: Can I access it directly?
    openUILinkIn: function(url, where)
    {
        if (!where)
            return;

        if ((url == null) || (url == ""))
            return;

        // xlate the URL if necessary
        if (url.indexOf("urn:") == 0)
            url = xlateURL(url);        // does RDF urn expansion

        // avoid loading "", since this loads a directory listing
        if (url == "")
            url = "about:blank";

        if (where == "save")
        {
            saveURL(url, null, null, true);
            return;
        }

        var w = (where == "window") ? null : this.getTopWin();
        if (!w)
        {
            openDialog(getBrowserURL(), "_blank", "chrome,all,dialog=no", url);
            return;
        }
        var browser = w.document.getElementById("content");

        switch (where)
        {
            case "current":
                browser.loadURI(url);
                w.content.focus();
                break;
            case "tabshifted":
            case "tab":
                var tab = browser.addTab(url);
                if ((where == "tab") ^ this.getBoolPref("browser.tabs.loadBookmarksInBackground",
                                                        false))
                {
                    browser.selectedTab = tab;
                    w.content.focus();
                }
                break;
        }
    },

    // From Mozilla utilityOverlay.js
    getTopWin: function()
    {
        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].
                                getService();
        var windowManagerInterface = windowManager.QueryInterface(
                                        Components.interfaces.nsIWindowMediator);
        var topWindowOfType = windowManagerInterface.getMostRecentWindow("navigator:browser");

        if (topWindowOfType)
            return topWindowOfType;

        return null;
    },

    // From Mozilla utilityOverlay.js
    getBoolPref: function(prefname, def)
    {
        try
        {
            var pref = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefBranch);
            return pref.getBoolPref(prefname);
        }
        catch(ex)
        {
            return def;
        }
    },

    // Build an array sorted by domain name with properties populated, as
    // available, for site tag, master key and options.
    getSavedEntries: function()
    {
        // Because of Javascript limitations on associative arrays, e.g. not
        // handling non-alphanumeric,  we'll go to the trouble of building
        // separate sortable arrays of site tags, master keys and options using
        // domain/value objects.  After sorting the three arrays we can walk
        // through them and build the returned array of fully-fleshed-out
        // objects.
        var siteTags   = new Array();
        var masterKeys = new Array();
        var options    = new Array();
        if (this.hasLoginManager())
            this.getAllLoginManagerEntries(siteTags, masterKeys, options);
        else
            this.getAllPasswordManagerEntries(siteTags, masterKeys, options);

        var entries = Array();
        siteTags.sort(  function(a, b) {return a.name.localeCompare(b.name);});
        masterKeys.sort(function(a, b) {return a.name.localeCompare(b.name);});
        options.sort(   function(a, b) {return a.name.localeCompare(b.name);});
        var iSiteTag = 0, iMasterKey = 0, iOption = 0;
        while (iSiteTag   <   siteTags.length ||
               iMasterKey < masterKeys.length ||
               iOption    <    options.length)
        {
            // Find the lowest domain name from the three waiting values
            var next = null;
            if (iSiteTag < siteTags.length && (next == null ||
                siteTags[iSiteTag].name < next))
                next = siteTags[iSiteTag].name;
            if (iMasterKey < masterKeys.length && (next == null ||
                masterKeys[iMasterKey].name < next))
                next = masterKeys[iMasterKey].name;
            if (iOption < options.length && (next == null ||
                options[iOption].name < next))
                next = options[iOption].name;
            // Grab all data with a matching domain name and advance the corresponding index
            entries[entries.length] = {name: next};
            if (iSiteTag < siteTags.length && next == siteTags[iSiteTag].name)
            {
                entries[entries.length-1].siteTag = siteTags[iSiteTag].value;
                iSiteTag++;
            }
            else
                entries[entries.length-1].siteTag = "";
            if (iMasterKey < masterKeys.length && next == masterKeys[iMasterKey].name)
            {
                entries[entries.length-1].masterKey = masterKeys[iMasterKey].value;
                iMasterKey++;
            }
            else
                entries[entries.length-1].masterKey = "";
            if (iOption < options.length && next == options[iOption].name)
            {
                entries[entries.length-1].options = options[iOption].value;
                iOption++;
            }
            else
                entries[entries.length-1].options = "";
        }
        return entries;
    },

    // Gather all extension-related FF3 login manager entries.  Return as 3
    // arrays for site tags, master keys and options.
    getAllLoginManagerEntries: function(siteTags, masterKeys, options)
    {
        var logins = this.findAllLoginManagerLogins();
        for (var i = 0; i < logins.length; i++)
        {
            var login = logins[i];
            try
            {
                if (login.hostname == this.host)
                {
                    if (login.username.indexOf("site-tag-") == 0)
                    {
                        var o = new Object();
                        o.name = login.username.substring(9);
                        o.value = login.password;
                        siteTags[siteTags.length] = o;
                    }
                    else
                    {
                        if (login.username.indexOf("master-key-") == 0)
                        {
                            var o = new Object();
                            o.name = login.username.substring(11);
                            o.value = login.password;
                            masterKeys[masterKeys.length] = o;
                        }
                        else
                        {
                            if (login.username.indexOf("options-") == 0)
                            {
                                var o = new Object();
                                o.name = login.username.substring(8);
                                o.value = login.password;
                                options[options.length] = o;
                            }
                        }
                    }
                }
            }
            catch(e) {}
        }
    },

    // Gather all extension-related FF2 login manager entries.  Return as 3
    // arrays for site tags, master keys and options.
    getAllPasswordManagerEntries: function(siteTags, masterKeys, options)
    {
        var passwordManager = Components.classes["@mozilla.org/passwordmanager;1"].
                                    createInstance();
        passwordManager.QueryInterface(Components.interfaces.nsIPasswordManager);
        passwordManager.QueryInterface(Components.interfaces.nsIPasswordManagerInternal);
        var passwordEnumerator = passwordManager.enumerator;
        while(passwordEnumerator.hasMoreElements())
        {
            try
            {
                var pw = passwordEnumerator.getNext()
                        .QueryInterface(Components.interfaces.nsIPasswordInternal);
                if (pw.host == this.host)
                {
                    if (pw.user.indexOf("site-tag-") == 0)
                    {
                        var o = new Object();
                        o.name = pw.user.substring(9);
                        o.value = pw.password;
                        siteTags[siteTags.length] = o;
                    }
                    else
                    {
                        if (pw.user.indexOf("master-key-") == 0)
                        {
                            var o = new Object();
                            o.name = pw.user.substring(11);
                            o.value = pw.password;
                            masterKeys[masterKeys.length] = o;
                        }
                        else
                        {
                            if (pw.user.indexOf("options-") == 0)
                            {
                                var o = new Object();
                                o.name = pw.user.substring(8);
                                o.value = pw.password;
                                options[options.length] = o;
                            }
                        }
                    }
                }
            }
            catch(e) {}
        }
    },

    getResourceFile: function(uri)
    {
        var handler = Components.classes["@mozilla.org/network/protocol;1?name=file"]
                            .createInstance(Components.interfaces.nsIFileProtocolHandler);
        var urlSrc = Components.classes["@mozilla.org/network/standard-url;1"]
                            .createInstance( Components.interfaces.nsIURL );
        urlSrc.spec = uri;
        var chromeReg = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                            .getService( Components.interfaces.nsIChromeRegistry );
        var urlIn = chromeReg.convertChromeURL(urlSrc);
        return handler.getFileFromURLSpec(urlIn.spec);
    },

    openInputFile: function(fileIn)
    {
        var streamIn = Components.classes["@mozilla.org/network/file-input-stream;1"]
                            .createInstance(Components.interfaces.nsIFileInputStream);
        streamIn.init(fileIn, 0x01, 0444, 0);
        streamIn.QueryInterface(Components.interfaces.nsILineInputStream);
        return streamIn;
    },

    openOutputFile: function(fileOut)
    {
        var streamOut = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                 .createInstance(Components.interfaces.nsIFileOutputStream);
        streamOut.init(fileOut, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
        return streamOut;
    },

    streamWriteLine: function(stream, line)
    {
        stream.write(line, line.length);
        stream.write("\n", 1);
    },

    // Expand variables and return resulting string
    expandLine: function(lineIn)
    {
        var strings = document.getElementById("pshOpt_strings");
        var lineOut = "";
        var splicePos = 0;
        var re = /[$][{][ \t]*([^ }]+)[^}]*[}]/g;
        var match;
        while ((match = re.exec(lineIn)) != null)
        {
            lineOut += lineIn.substr(splicePos, match.index);
            try
            {
                lineOut += strings.getString(match[1]);
            }
            catch (ex)
            {
                alert("Couldn't find string \"" + match[1] + "\"");
                lineOut += "???" + match[1] + "???";
            }
            splicePos = re.lastIndex;
        }
        lineOut += lineIn.substr(splicePos);
        return lineOut;
    },

    // Expand variables and write line to output stream
    streamWriteExpandedLine: function(stream, line)
    {
        PassHashCommon.streamWriteLine(stream, PassHashCommon.expandLine(line));
    },

    browseFile: function(file, where)
    {
        var handler = Components.classes["@mozilla.org/network/protocol;1?name=file"]
                            .createInstance(Components.interfaces.nsIFileProtocolHandler);
        PassHashCommon.openUILinkIn(handler.getURLSpecFromFile(file), where);
    },

    pickHTMLFile: function(titleTag, defaultName)
    {
        var title = document.getElementById("pshOpt_strings").getString(titleTag);
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        if (defaultName)
            picker.defaultString = defaultName;
        picker.appendFilters(nsIFilePicker.filterHTML);
        picker.init(window, title, nsIFilePicker.modeSave);
        var file;
        do
        {
            var action = picker.show();
            if (action == 1)
                return null;
            file = picker.file;
            if (! /\.html{0,1}$/.test(picker.file.path))
                file.initWithPath(picker.file.path + ".html");
            picker.defaultString = file.leafName;
        }
        while (file.exists() && (action == 0));
        return file;
    }

    //NB: Make sure not to add a comma after the last function for older IE compatibility.
}
