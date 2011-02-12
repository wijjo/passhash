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
 
var PassHash =
{
    // These variables track whether or not dialog regions are hidden.
    optionsHidden: true,
    notesHidden:   true,

    // These variables are initialized to preference defaults and some are kept
    // in sync with control state, as appropriate.
    guessSiteTag:        null,
    rememberSiteTag:     null,
    rememberMasterKey:   null,
    revealSiteTag:       null,
    revealHashWord:      null,
    guessFullDomain:     null,
    requireDigit:        null,
    requirePunctuation:  null,
    requireMixedCase:    null,
    restrictSpecial:     null,
    restrictDigits:      null,
    hashWordSize:        null,

    onLoad: function()
    {
        var ctlSiteTag            = document.getElementById("site-tag");
        var ctlMasterKey          = document.getElementById("master-key");
        var ctlRequireDigit       = document.getElementById("digit");
        var ctlRequirePunctuation = document.getElementById("punctuation");
        var ctlRequireMixedCase   = document.getElementById("mixedCase");
        var ctlRestrictSpecial    = document.getElementById("noSpecial");
        var ctlRestrictDigits     = document.getElementById("digitsOnly");
        var ctlHashWordSize       = document.getElementById("hashWordSize");

        var prefs = PassHashCommon.loadOptions();
        this.guessSiteTag       = prefs.guessSiteTag;
        this.rememberSiteTag    = prefs.rememberSiteTag;
        this.rememberMasterKey  = prefs.rememberMasterKey;
        this.revealSiteTag      = prefs.revealSiteTag;
        this.revealHashWord     = prefs.revealHashWord;
        this.guessFullDomain    = prefs.guessFullDomain;
        this.requireDigit       = prefs.digitDefault;
        this.requirePunctuation = prefs.punctuationDefault;
        this.requireMixedCase   = prefs.mixedCaseDefault;
        this.restrictSpecial    = false;
        this.restrictDigits     = false;
        this.hashWordSize       = prefs.hashWordSizeDefault;

        this.onUnmask();

        var defaultSiteTag = "";
        var domain = PassHashCommon.getDomain(window.arguments[0].input);
        var defaultSiteTag = "";
        if (this.guessSiteTag && domain != null)
            defaultSiteTag = (this.guessFullDomain ? domain : domain.split(".")[0]);
        ctlSiteTag.value = PassHashCommon.loadSecureValue(
                                this.rememberSiteTag,
                                "site-tag",
                                domain,
                                defaultSiteTag);
        ctlMasterKey.value = PassHashCommon.loadSecureValue(
                                this.rememberMasterKey,
                                "master-key",
                                domain,
                                "");

        // Assume if there's a master key present without an options string
        // that we're on a site that was last accessed under an older version
        // of this extension, i.e. before hash word options were supported.  If
        // so, force it to start with cleared options for backward
        // compatibility.  Otherwise use the preferences as the default.
        var strDefOptions = (ctlMasterKey.value ? "" : this.getOptionString());
        var strOptions2 = PassHashCommon.loadSecureValue(true, "options", domain, strDefOptions);
        this.parseOptionString(strOptions2);
        // This is the only time we write to the option controls.  Otherwise we
        // just react to their state changes.
        ctlRequireDigit.checked        = this.requireDigit;
        ctlRequirePunctuation.checked  = this.requirePunctuation;
        ctlRequireMixedCase.checked    = this.requireMixedCase;
        ctlRestrictSpecial.checked     = this.restrictSpecial;
        ctlRestrictDigits.checked      = this.restrictDigits;
        this.updateCheckboxes();

        var btn = document.getElementById("hashWordSize"+this.hashWordSize);
        // Protect against bad saved hashWordSize value.
        if (btn == null)
        {
            btn = document.getElementById("hashWordSize8");
            this.hashWordSize = 8;
        }
        ctlHashWordSize.selectedItem = btn;

        this.updateOptionsVisibility();     // Hide the options
        this.updateNotesVisibility();       // Hide the notes

        if (ctlSiteTag.value)
        {
            ctlMasterKey.select();
            ctlMasterKey.focus();
        }
        else
        {
            ctlSiteTag.select();
            ctlSiteTag.focus();
        }

        this.updateHashWord();
    },

    onAccept: function()
    {
        if (this.update())
        {
            var domain = PassHashCommon.getDomain(window.arguments[0].input);
            PassHashCommon.saveSecureValue(
                                this.rememberSiteTag,
                                "site-tag",
                                domain,
                                document.getElementById("site-tag").value);
            PassHashCommon.saveSecureValue(
                                this.rememberMasterKey,
                                "master-key",
                                domain,
                                document.getElementById("master-key").value);
            var strOptions = this.getOptionString();
            PassHashCommon.saveSecureValue(true, "options", domain, strOptions);
            window.arguments[0].output = document.getElementById("hash-word" ).value;
            return true;
        }
        return false;
    },

    onOptions: function()
    {
        this.optionsHidden = !this.optionsHidden;
        this.updateOptionsVisibility();
    },

    onDisclosure: function()
    {
        this.notesHidden = !this.notesHidden;
        this.updateNotesVisibility();
    },

    updateOptionsVisibility: function()
    {
        document.getElementById("options-box").hidden = this.optionsHidden;
        var strName = (this.optionsHidden ? "passhashOptionsLabel1" : "passhashOptionsLabel2");
        var label = document.getElementById("passhash_strings").getString(strName);
        document.getElementById("options").label = label;
        window.sizeToContent();
    },

    updateNotesVisibility: function()
    {
        document.getElementById("notes").hidden = this.notesHidden;
        var strName = (this.notesHidden ? "passhashDisclosureLabel1" : "passhashDisclosureLabel2");
        var label = document.getElementById("passhash_strings").getString(strName);
        document.documentElement.getButton("disclosure").label = label;
        window.sizeToContent();
    },

    onUnmask: function()
    {
        var ctlSiteTag   = document.getElementById("site-tag");
        var ctlMasterKey = document.getElementById("master-key");
        var ctlHashWord  = document.getElementById("hash-word");
        if (document.getElementById("unmask").checked)
        {
            ctlSiteTag  .setAttribute("type", "");
            ctlMasterKey.setAttribute("type", "");
            ctlHashWord .setAttribute("type", "");
        }
        else
        {
            ctlSiteTag  .setAttribute("type", this.revealSiteTag  ? "" : "password");
            ctlMasterKey.setAttribute("type", "password");
            ctlHashWord .setAttribute("type", this.revealHashWord ? "" : "password");
        }
        this.update();
    },

    onBlurSiteTag: function()
    {
        var ctlSiteTag = document.getElementById("site-tag");
        ctlSiteTag.value = ctlSiteTag.value.replace(/^[ \t]*(.*)[ \t]*$/, "$1");
    },

    onBumpSiteTag: function()
    {
        var ctlSiteTag = document.getElementById("site-tag");
        ctlSiteTag.value = PassHashCommon.bumpSiteTag(ctlSiteTag.value);
        this.update();
    },

    // Generate hash word if possible
    // Returns:
    //  0 = Hash word ok, but unchanged
    //  1 = Site tag bad or missing
    //  2 = Master key bad or missing
    //  3 = Hash word successfully generated
    updateHashWord: function()
    {
        var ctlSiteTag   = document.getElementById("site-tag"  );
        var ctlMasterKey = document.getElementById("master-key");
        var ctlHashWord  = document.getElementById("hash-word" );
        if (!ctlSiteTag.value)
            return 1;
        if (!ctlMasterKey.value)
            return 2;
        // Change the hash word and determine whether or not it was modified.
        var hashWordOrig = ctlHashWord.value;
        ctlHashWord.value = PassHashCommon.generateHashWord(
                ctlSiteTag.value,
                ctlMasterKey.value,
                this.hashWordSize,
                this.requireDigit,
                this.requirePunctuation,
                this.requireMixedCase,
                this.restrictSpecial,
                this.restrictDigits);
        if (ctlHashWord.value != hashWordOrig)
            return 3;   // It was modified
        return 0;       // It was not modified
    },

    onRequireDigitChanged: function()
    {
        this.requireDigit = document.getElementById("digit").checked;
        this.update();
    },

    onRequirePunctuationChanged: function()
    {
        this.requirePunctuation = document.getElementById("punctuation").checked;
        this.update();
    },

    onRequireMixedCaseChanged: function()
    {
        this.requireMixedCase = document.getElementById("mixedCase").checked;
        this.update();
    },

    onRestrictSpecialChanged: function()
    {
        this.restrictSpecial = document.getElementById("noSpecial").checked;
        this.update();
    },

    onRestrictDigitsChanged: function()
    {
        this.restrictDigits = document.getElementById("digitsOnly").checked;
        this.update();
    },

    onHashWordSizeChanged: function()
    {
        this.hashWordSize = document.getElementById("hashWordSize").selectedItem.value;
        this.update();
    },

    updateCheckboxes: function()
    {
        document.getElementById("digit").disabled =
                this.restrictDigits;
        document.getElementById("punctuation").disabled =
                (this.restrictSpecial || this.restrictDigits);
        document.getElementById("mixedCase").disabled =
                this.restrictDigits;
        document.getElementById("noSpecial").disabled =
                this.restrictDigits;
        document.getElementById("digitsOnly").disabled =
                false;  // Can always add digits-only as a further restriction
    },

    // Determines where to focus and generates the hash word when adequate
    // information is available.
    update: function() 
    {
        this.updateCheckboxes()
        switch (this.updateHashWord())
        {
            case 1:
                document.getElementById("site-tag").focus();
                return false;
            case 2:
                document.getElementById("master-key").focus();
                return false;
            case 3:
                document.documentElement.getButton("accept").focus();
                return false;
        }
        document.documentElement.getButton("accept").focus();
        return true;
    },

    parseOptionString: function(s)
    {
        this.requireDigit       = (s.search(/d/i) >= 0);
        this.requirePunctuation = (s.search(/p/i) >= 0);
        this.requireMixedCase   = (s.search(/m/i) >= 0);
        this.restrictSpecial    = (s.search(/r/i) >= 0);
        this.restrictDigits     = (s.search(/g/i) >= 0);
        var sizeMatch = s.match(/[0-9]+/);
        this.hashWordSize = (sizeMatch != null && sizeMatch.length > 0
                                    ? parseInt(sizeMatch[0])
                                    : 8);
    },

    getOptionString: function()
    {
        var opts = '';
        if (this.requireDigit)
            opts += 'd';
        if (this.requirePunctuation)
            opts += 'p';
        if (this.requireMixedCase)
            opts += 'm';
        if (this.restrictSpecial)
            opts += 'r';
        if (this.restrictDigits)
            opts += 'g';
        opts += this.hashWordSize.toString();
        return opts;
    }

}
