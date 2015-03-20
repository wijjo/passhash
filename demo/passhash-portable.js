var browser = new Object();
browser.version = parseInt(navigator.appVersion);
browser.isNetscape = false;
browser.isMicrosoft = false;
if (navigator.appName.indexOf("Netscape") != -1) 
    browser.isNetscape = true;
else if (navigator.appName.indexOf("Microsoft") != -1)
    browser.isMicrosoft = true;

var siteTagLast = '';
var masterKeyLast = '';

function onLoad()
{
    if (browser.isMicrosoft)
    {
        document.getElementById('reveal').disabled = true;
        document.getElementById('reveal-text').disabled = true;
    }
    document.getElementById('site-tag').focus();
    setTimeout('checkChange()',1000);
}

function validate(form) 
{
    var siteTag   = document.getElementById('site-tag');
    var masterKey = document.getElementById('master-key');
    if (!siteTag.value)
    {
        siteTag.focus();
        return false;
    }
    if (!masterKey.value)
    {
        masterKey.focus();
        return false;
    }
    return true;
}

function update() 
{
    var siteTag   = document.getElementById('site-tag');
    var masterKey = document.getElementById('master-key');
    var hashWord  = document.getElementById('hash-word');
    var submit    = document.getElementById('submit');
    if (submit.value == 'Another')
    {
        siteTag.focus();
        submit.value = 'OK';
        hashWord.value = '';
    }
    else
    {
        //var hashapass = b64_hmac_sha1(masterKey.value, siteTag.value).substr(0,8);
        var hashWordSize       = 8;
        var requireDigit       = document.getElementById("digit").checked;
        var requirePunctuation = document.getElementById("punctuation").checked;
        var requireMixedCase   = document.getElementById("mixedCase").checked;
        var restrictSpecial    = document.getElementById("noSpecial").checked;
        var restrictDigits     = document.getElementById("digitsOnly").checked;
        if      (document.getElementById("s6" ).checked) hashWordSize = 6;
        else if (document.getElementById("s8" ).checked) hashWordSize = 8;
        else if (document.getElementById("s10").checked) hashWordSize = 10;
        else if (document.getElementById("s12").checked) hashWordSize = 12;
        else if (document.getElementById("s14").checked) hashWordSize = 14;
        else if (document.getElementById("s16").checked) hashWordSize = 16;
        else if (document.getElementById("s18").checked) hashWordSize = 18;
        else if (document.getElementById("s20").checked) hashWordSize = 20;
        else if (document.getElementById("s22").checked) hashWordSize = 22;
        else if (document.getElementById("s24").checked) hashWordSize = 24;
        else if (document.getElementById("s26").checked) hashWordSize = 26;
        hashWord.value = PassHashCommon.generateHashWord(
                siteTag.value,
                masterKey.value,
                hashWordSize,
                requireDigit,
                requirePunctuation,
                requireMixedCase,
                restrictSpecial,
                restrictDigits);
        hashWord.focus();
        submit.value = 'Another';
    }
    siteTagLast = siteTag.value;
    masterKeyLast = masterKey.value;
}

function onEnterField(fld, msg)
{
    // Select the field
    try
    {
        fld.select();
    }
    catch (ex) {}
    // Set the prompt
    document.getElementById('prompt').innerHTML = msg;
}

function checkChange()
{
    var siteTag   = document.getElementById('site-tag');
    var masterKey = document.getElementById('master-key');
    var hashWord  = document.getElementById('hash-word');
    if (siteTag.value != siteTagLast || masterKey.value != masterKeyLast)
    {
        hashWord.value = '';
        siteTagLast = siteTag.value;
        masterKeyLast = masterKey.value;
    }
    setTimeout('checkChange()', 1000);
}

function onEnterSubmitButton(fld)
{
    if (fld.value == 'Another')
        onEnterField(fld, 'Start another hashword');
    else
        onEnterField(fld, 'Generate hashword');
}

function onLeaveField(fld)
{
    // Remove the selection (is this the best way?)
    var v = fld.value;
    fld.value = '';
    fld.value = v;
    // Remove the prompt
    document.getElementById('prompt').innerHTML = '';
}

function onLeaveResultField(hashWord)
{
    var submit = document.getElementById('submit');
    submit.value = 'OK';
//    hashWord.value = '';
    document.getElementById('prompt').innerHTML = '';
}

function onReveal(fld)
{
    var masterKey = document.getElementById('master-key');
    try
    {
        if (fld.checked)
            masterKey.setAttribute("type", "");
        else
            masterKey.setAttribute("type", "password");
    } catch (ex) {}
    document.getElementById('master-key').focus();
}

function onNoSpecial(fld)
{
    document.getElementById('punctuation').disabled = fld.checked;
    update();
}

function onDigitsOnly(fld)
{
    document.getElementById('punctuation').disabled = fld.checked;
    document.getElementById("digit"      ).disabled = fld.checked;
    document.getElementById("punctuation").disabled = fld.checked;
    document.getElementById("mixedCase"  ).disabled = fld.checked;
    document.getElementById("noSpecial"  ).disabled = fld.checked;
    update();
}

function onBump()
{
    var siteTag = document.getElementById("site-tag");
    siteTag.value = PassHashCommon.bumpSiteTag(siteTag.value);
    update();
}

function onSelectSiteTag(fld)
{
    var siteTag = document.getElementById('site-tag');
    siteTag.value = fld[fld.selectedIndex].text;
    var options = fld[fld.selectedIndex].value;
    document.getElementById("digit"      ).checked  = (options.search(/d/i) >= 0);
    document.getElementById("punctuation").checked  = (options.search(/p/i) >= 0);
    document.getElementById("mixedCase"  ).checked  = (options.search(/m/i) >= 0);
    document.getElementById("noSpecial"  ).checked  = (options.search(/r/i) >= 0);
    document.getElementById("digitsOnly" ).checked  = (options.search(/g/i) >= 0);
    document.getElementById('punctuation').disabled = (options.search(/[rg]/i) >= 0);
    document.getElementById("digit"      ).disabled = (options.search(/g/i) >= 0);
    document.getElementById("punctuation").disabled = (options.search(/g/i) >= 0);
    document.getElementById("mixedCase"  ).disabled = (options.search(/g/i) >= 0);
    document.getElementById("noSpecial"  ).disabled = (options.search(/g/i) >= 0);
    var sizeMatch = options.match(/[0-9]+/);
    var hashWordSize = (sizeMatch != null && sizeMatch.length > 0
                                ? parseInt(sizeMatch[0])
                                : 8);
    document.getElementById("s6" ).checked = (hashWordSize == 6 );
    document.getElementById("s8" ).checked = (hashWordSize == 8 );
    document.getElementById("s10").checked = (hashWordSize == 10);
    document.getElementById("s12").checked = (hashWordSize == 12);
    document.getElementById("s14").checked = (hashWordSize == 14);
    document.getElementById("s16").checked = (hashWordSize == 16);
    document.getElementById("s18").checked = (hashWordSize == 18);
    document.getElementById("s20").checked = (hashWordSize == 20);
    document.getElementById("s22").checked = (hashWordSize == 22);
    document.getElementById("s24").checked = (hashWordSize == 24);
    document.getElementById("s26").checked = (hashWordSize == 26);
    if (validate())
        update();
}

function onLeaveSelectSiteTag(fld)
{
    // Remove the prompt
    document.getElementById('prompt').innerHTML = '';
}
