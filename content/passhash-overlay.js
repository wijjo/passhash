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
 
// Some marker management code was dapted from informenter extension code
//  informenter URL: http://informenter.mozdev.org/

var PassHash =
{
    markerNumber: 1,
    options: null,

    onLoad: function()
    {
        this.options = PassHashCommon.loadOptions();
        document.getElementById("contentAreaContextMenu").
                addEventListener("popupshowing", this.onContextMenuUpdate, false);
        this.markerNumber = 1;
        window.onclick = this.checkMarkerClick;
        if (this.options.showMarker || this.options.unmaskMarker)
            this.addMarkers(window.content, this.options.showMarker, this.options.unmaskMarker);
        // Override the default shortcut key?
        if (this.options.shortcutKeyCode && this.options.shortcutKeyMods)
        {
            var elementKey = document.getElementById("key_passhash");
            if (this.options.shortcutKeyCode.substr(0, 3) == "VK_")
            {
                elementKey.removeAttribute("key");
                elementKey.setAttribute("keycode", this.options.shortcutKeyCode);
            }
            else
            {
                elementKey.removeAttribute("keycode");
                elementKey.setAttribute("key", this.options.shortcutKeyCode);
            }
            elementKey.setAttribute("modifiers", this.options.shortcutKeyMods);
        }
    },

    getTextNode: function()
    {
        var node = document.commandDispatcher.focusedElement;
        if (node != null && PassHashCommon.isTextNode(node) && !node.disabled && !node.readOnly)
            return node;
        return null;
    },

    onInvokeDialog: function()
    {
        var textNode = this.getTextNode();
        if (textNode != null)
            this.invokeDialog(textNode);
    },

    onContextMenuUpdate: function()
    {
        document.getElementById("contextmenu_passhash")
                        .setAttribute("hidden", !gContextMenu.onTextInput);
    },

    addMarkers: function(windowCurrent, dialogButton, unmaskButton) 
    {
        var inputs = windowCurrent.document.getElementsByTagName("input");

        for (var i = 0; i < inputs.length; i++)
        {
            var type = inputs[i].getAttribute("type");
            if (type == "password" && !inputs[i].hasAttribute("phNoMarkers"))
                this.attachMarkers(windowCurrent.document, inputs[i], dialogButton, unmaskButton);
        }

        /* Recursively process subframes */
        for (i = 0; i < windowCurrent.frames.length; i++)
            this.addMarkers(windowCurrent.frames[i]);
    },

    attachMarkers: function(doc, field, dialogButton, unmaskButton)
    {
        // Prevent reprocessing this field
        field.setAttribute("phNoMarkers", true);
        if (unmaskButton || dialogButton)
        {
            var tableNode = doc.createElement("TABLE");
            tableNode.setAttribute("style", "width: 30px;"
                                          + "margin: 0;"
                                          + "padding: 0");
            field.parentNode.insertBefore(tableNode, field.nextSibling);
            var trNode = doc.createElement("TR");
            trNode.setAttribute("style", "margin: 0;"
                                       + "padding: 0")
            var name = field.getAttribute("name");
            tableNode.appendChild(trNode);
            if (dialogButton)
                this.createMarkerCell(doc, trNode, name, "marker", "passhashMarkerTip");
            if (unmaskButton)
                this.createMarkerCell(doc, trNode, name, "unmask", "passhashUnmaskTip");
            // The line break avoids some overlapping problems on certain sites
            var brNode = doc.createElement("BR");
            field.parentNode.insertBefore(brNode, tableNode);
        }
        this.markerNumber++;
    },

    createMarkerCell: function(doc, trNode, name, tag, tip)
    {
        var tdNode = doc.createElement("TD");
        PassHash.setMarkerStyle(tdNode, false);
        var id =  name + "_passhash_" + tag + "_" + this.markerNumber;
        tdNode.setAttribute("id", id);
        tdNode.setAttribute("class", "passhash_marker");
        tdNode.setAttribute("title", document.getElementById("passhash_strings").getString(tip));
        tdNode.textContent = (tag == "unmask" ? "*" : "#");
        trNode.appendChild(tdNode);
    },

    checkMarkerClick: function(event)
    {
        // Looking for a left-click and one of our markers
        if (event.button == 0 && PassHash.isMarker(event.target, ""))
        {
            var textNode = PassHash.getMarkerTarget(event.target);
            if (textNode != null)
            {
                // Dialog marker?
                if (PassHash.isMarker(event.target, "marker"))
                {
                    PassHash.invokeDialog(textNode);
                    return false;   // handled
                }
                // Unmask marker?
                else if (PassHash.isMarker(event.target, "unmask"))
                {
                    PassHash.toggleMask(textNode);
                    return false;   // handled
                }
            }
        }
        return true;    // Not handled
    },

    isMarker: function(node, tag)
    {
        try
        {
            var name = node.localName.toUpperCase();
            return (name == "TD" && node.id.toString().indexOf("_passhash_"+tag) >= 0)
        }
        catch(e) {}
        return false;
    },

    setMarkerStyle: function(node, clicked)
    {
        var bgColor = (clicked ? "#a0d0a0" : "#eeffee");
        node.setAttribute("style", "border: thin solid #80c080;"
                                 + "background-color: " + bgColor + ";"
                                 + "margin: 0 1px;"
                                 + "padding: 0;"
                                 + "font: 12px serif;"
                                 + "color: #609060;"
                                 + "cursor: pointer;"
                                 + "min-width: 12px;"
                                 + "text-align: center;"
                                 + "vertical-align: middle;");
    },

    // Markers are a TD - child of TR - child of TABLE - sibling of INPUT + BR
    getMarkerTarget: function(node)
    {
        var foundNode = null;
        try
        {
            var checkNode = node.parentNode.parentNode.previousSibling.previousSibling;
            if (PassHashCommon.isTextNode(checkNode))
                foundNode = checkNode;
        }
        catch(e) {}
        return foundNode;
    },

    // Markers are a TD - child of TR - child of TABLE - sibling of INPUT + BR
    getTargetMarker: function(node, tag)
    {
        var foundNode = null;
        try
        {
            // Expect marker nodes to all immediately follow the BR after the input field.
            var checkNode = node.nextSibling.nextSibling.firstChild.firstChild;
            if (PassHash.isMarker(checkNode, tag))
                foundNode = checkNode;
            else if (PassHash.isMarker(checkNode.nextSibling, tag))
                foundNode = checkNode.nextSibling;
        }
        catch(e) {}
        return foundNode;
    },

    invokeDialog: function(textNode)
    {
        var marker = PassHash.getTargetMarker(textNode, "marker");
        if (marker != null)
            PassHash.setMarkerStyle(marker, true);
        textNode.disabled = true;
        var params = {input: content.document.location, output: null};
        window.openDialog("chrome://passhash/content/passhash-dialog.xul", "dlg",
                          "modal,centerscreen", params);
        textNode.disabled = false;
        if (marker != null)
            PassHash.setMarkerStyle(marker, false);
        var hashapass = params.output;
        if (hashapass)
        {
            textNode.value = hashapass;
            textNode.focus();
            textNode.select();
        }
        else
            textNode.focus();
    },

    toggleMask: function(textNode)
    {
        var marker = PassHash.getTargetMarker(textNode, "unmask");
        if (textNode.type == "password")
        {
            if (marker != null)
                PassHash.setMarkerStyle(marker, true);
            textNode.setAttribute("type", "");
            textNode.setAttribute("phUnmasked", "true");
        }
        else
        {
            if (marker != null)
                PassHash.setMarkerStyle(marker, false);
            textNode.setAttribute("type", "password");
            textNode.setAttribute("phUnmasked", "false");
        }
    }
};

window.addEventListener("load",  function(e) { PassHash.onLoad(e); }, true);
window.addEventListener("focus", function(e) { PassHash.onLoad(e); }, true);
