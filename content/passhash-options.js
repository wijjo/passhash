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
 
// Password manager enumeration code "borrowed" from the password_exporter extension,
// written by Justin Scott.

var PassHashOptions =
{
    notesHidden: true,

    onLoad: function()
    {
        var opts = PassHashCommon.loadOptions();
        document.getElementById("pshOpt_security").selectedItem =
                    this.getSecurityRadio(opts.securityLevel);
        document.getElementById("pshOpt_guessSiteTag"       ).checked = opts.guessSiteTag;
        document.getElementById("pshOpt_rememberSiteTag"    ).checked = opts.rememberSiteTag;
        document.getElementById("pshOpt_rememberMasterKey"  ).checked = opts.rememberMasterKey;
        document.getElementById("pshOpt_revealSiteTag"      ).checked = opts.revealSiteTag;
        document.getElementById("pshOpt_revealHashWord"     ).checked = opts.revealHashWord;
        document.getElementById("pshOpt_showMarker"         ).checked = opts.showMarker;
        document.getElementById("pshOpt_unmaskMarker"       ).checked = opts.unmaskMarker;
        document.getElementById("pshOpt_guessFullDomain"    ).checked = opts.guessFullDomain;
        document.getElementById("pshOpt_digitDefault"       ).checked = opts.digitDefault;
        document.getElementById("pshOpt_punctuationDefault" ).checked = opts.punctuationDefault;
        document.getElementById("pshOpt_mixedCaseDefault"   ).checked = opts.mixedCaseDefault;
        document.getElementById("pshOpt_hashWordSizeDefault").selectedItem =
                    this.getHashWordSizeDefaultRadio(opts.hashWordSizeDefault);
        PassHashOptions.applySecurityLevel();
        document.getElementById("pshOpt_security").
                addEventListener("RadioStateChange", this.onSecurityLevel, false);
        // Show the notes the first time.  Start with them hidden otherwise.
        if (opts.firstTime)
            this.notesHidden = true;
        this.updateNotesVisibility();
    },

    onAccept: function()
    {
        var opts = PassHashCommon.createOptions();
        opts.securityLevel       = PassHashOptions.readSecurityLevel();
        opts.guessSiteTag        = document.getElementById("pshOpt_guessSiteTag"      ).checked;
        opts.rememberSiteTag     = document.getElementById("pshOpt_rememberSiteTag"   ).checked;
        opts.rememberMasterKey   = document.getElementById("pshOpt_rememberMasterKey" ).checked;
        opts.revealSiteTag       = document.getElementById("pshOpt_revealSiteTag"     ).checked;
        opts.revealHashWord      = document.getElementById("pshOpt_revealHashWord"    ).checked;
        opts.guessFullDomain     = document.getElementById("pshOpt_guessFullDomain"   ).checked;
        opts.showMarker          = document.getElementById("pshOpt_showMarker"        ).checked;
        opts.unmaskMarker        = document.getElementById("pshOpt_unmaskMarker"      ).checked;
        opts.digitDefault        = document.getElementById("pshOpt_digitDefault"      ).checked;
        opts.punctuationDefault  = document.getElementById("pshOpt_punctuationDefault").checked;
        opts.mixedCaseDefault    = document.getElementById("pshOpt_mixedCaseDefault"  ).checked;
        opts.hashWordSizeDefault = PassHashOptions.readHashWordSizeDefault();
        PassHashCommon.saveOptions(opts);
    },

    onDisclosure: function()
    {
        this.notesHidden = !this.notesHidden;
        this.updateNotesVisibility();
    },

    onShowPortable: function()
    {
        try
        {
            var entries = PassHashCommon.getSavedEntries();
            var fileIn  = PassHashCommon.getResourceFile("chrome://passhash/content/passhash-portable.html");
            var fileOut = PassHashCommon.pickHTMLFile("passhashShowPortableTitle", "passhash.html");
            if (fileIn == null || fileOut == null)
                return;

            var streamIn  = PassHashCommon.openInputFile(fileIn);
            var streamOut = PassHashCommon.openOutputFile(fileOut);

            // Copy input to output stream, inject the following items:
            //  - site tag option list
            //  - included resources marked by <!--!directory:resource--> lines (whole line)
            //  - localized string substitutions marked by ${tag}
            var fillSiteTagList = false;
            var more = true;
            while (more)
            {
                var line = {};
                more = streamIn.readLine(line);

                // Found the control for the site tag list?
                if (!fillSiteTagList && line.value.search(/<select.* id="site-tag-list"/i) >= 0)
                    fillSiteTagList = true;
                PassHashCommon.streamWriteExpandedLine(streamOut, line.value);

                // Inject site tag option list after finding select element body.
                if (fillSiteTagList && line.value.search(/>/) >= 0)
                {
                    PassHashCommon.streamWriteLine(streamOut, "<option selected></option>");
                    for (var i = 0; i <  entries.length; i++)
                        if (entries[i].siteTag)
                            PassHashCommon.streamWriteLine(streamOut,
                                "<option" + ' value="' + entries[i].options + '"' + ">" +
                                    entries[i].siteTag +
                                "</option>");
                    fillSiteTagList = false;
                }

                // Append contents of other resource, e.g.  <!--!skin:passhash-portable.css-->
                var re = /<!--![ \t]*([a-z]+)[ \t]*:[ \t]*(.*)[ \t]*-->/g;
                var match;
                while ((matches = re.exec(line.value)) != null)
                {
                    var uri = "chrome://passhash/" + matches[1] + "/" + matches[2];
                    var fileIn2 = PassHashCommon.getResourceFile(uri);
                    if (fileIn2 != null)
                    {
                        var streamIn2  = PassHashCommon.openInputFile(fileIn2);
                        var line2 = {}, more2;
                        do
                        {
                            more2 = streamIn2.readLine(line2);
                            PassHashCommon.streamWriteExpandedLine(streamOut, line2.value);
                        }
                        while (more2);
                    }
                }
            }

            streamIn.close();
            streamOut.close();

            PassHashCommon.browseFile(fileOut, "tab");
        }
        catch (ex)
        {
            alert("Error creating Portable Page:\n" + ex);
        }
    },

    updateNotesVisibility: function()
    {
        document.getElementById("pshOpt_notes").hidden = this.notesHidden;
        var strName = (this.notesHidden ? "passhashDisclosureLabel1" : "passhashDisclosureLabel2");
        var label = document.getElementById("pshOpt_strings").getString(strName);
        document.documentElement.getButton("disclosure").label = label;
        window.sizeToContent();
    },

    readSecurityLevel: function()
    {
        var secbtn = document.getElementById("pshOpt_security").selectedItem;
        return (secbtn != null ? parseInt(secbtn.value) : 2);
    },

    getSecurityRadio: function(securityLevel)
    {
        return document.getElementById("pshOpt_security" + securityLevel);
    },

    onSecurityLevel: function(event)
    {
        PassHashOptions.applySecurityLevel();
    },

    applySecurityLevel: function()
    {
        var securityLevel = PassHashOptions.readSecurityLevel();
        document.getElementById("pshOpt_guessSiteTag"     ).disabled = true;
        document.getElementById("pshOpt_rememberSiteTag"  ).disabled = true;
        document.getElementById("pshOpt_rememberMasterKey").disabled = true;
        document.getElementById("pshOpt_revealSiteTag"    ).disabled = true;
        document.getElementById("pshOpt_revealHashWord"   ).disabled = true;
        switch (securityLevel)
        {
            case 1:
                document.getElementById("pshOpt_guessSiteTag"     ).checked = true;
                document.getElementById("pshOpt_rememberSiteTag"  ).checked = true;
                document.getElementById("pshOpt_rememberMasterKey").checked = true;
                document.getElementById("pshOpt_revealSiteTag"    ).checked = true;
                document.getElementById("pshOpt_revealHashWord"   ).checked = true;
                break;
            case 3:
                document.getElementById("pshOpt_guessSiteTag"     ).checked = false;
                document.getElementById("pshOpt_rememberSiteTag"  ).checked = false;
                document.getElementById("pshOpt_rememberMasterKey").checked = false;
                document.getElementById("pshOpt_revealSiteTag"    ).checked = false;
                document.getElementById("pshOpt_revealHashWord"   ).checked = false;
                break;
            case 4:
                document.getElementById("pshOpt_guessSiteTag"     ).disabled = false;
                document.getElementById("pshOpt_rememberSiteTag"  ).disabled = false;
                document.getElementById("pshOpt_rememberMasterKey").disabled = false;
                document.getElementById("pshOpt_revealSiteTag"    ).disabled = false;
                document.getElementById("pshOpt_revealHashWord"   ).disabled = false;
                break;
            case 2:
            default:
                document.getElementById("pshOpt_guessSiteTag"     ).checked = true;
                document.getElementById("pshOpt_rememberSiteTag"  ).checked = true;
                document.getElementById("pshOpt_rememberMasterKey").checked = false;
                document.getElementById("pshOpt_revealSiteTag"    ).checked = true;
                document.getElementById("pshOpt_revealHashWord"   ).checked = false;
                break;
        }
    },

    readHashWordSizeDefault: function()
    {
        var btn = document.getElementById("pshOpt_hashWordSizeDefault").selectedItem;
        return (btn != null ? parseInt(btn.value) : 8);
    },

    getHashWordSizeDefaultRadio: function(n)
    {
        return document.getElementById("pshOpt_hashWordSizeDefault" + n);
    }
}
