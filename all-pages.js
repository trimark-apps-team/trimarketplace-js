
// ===========================================================
// ===========================================================
// Accessibe Tool
// Date: 4/24/23, moved to left 6/5/23
// ===========================================================
// ===========================================================

(function () {
    var s = document.createElement('script');
    var h = document.querySelector('head') || document.body;
    s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
    s.async = true;
    s.onload = function () {
        acsbJS.init({
            statementLink: '',
            footerHtml: '<p>This is the footer</p>',
            hideMobile: false,
            hideTrigger: false,
            disableBgProcess: false,
            language: 'en',
            position: 'left',
            leadColor: '#146FF8',
            triggerColor: '#146FF8',
            triggerRadius: '50%',
            triggerPositionX: 'left',
            triggerPositionY: 'bottom',
            triggerIcon: 'people',
            triggerSize: 'bottom',
            triggerOffsetX: 20,
            triggerOffsetY: 20,
            mobile: {
                triggerSize: 'small',
                triggerPositionX: 'left',
                triggerPositionY: 'bottom',
                triggerOffsetX: 20,
                triggerOffsetY: 20,
                triggerRadius: '20'
            }
        });
    };
    h.appendChild(s);
})();

// ===========================================================
// ===========================================================
// END of Accessible Tool
// ===========================================================
// ===========================================================


// ===========================================================
// ===========================================================
// Common Code
// Author: Infor
// Date: 7/25/23
// Get user related info in global variables.
// This js is to be placed in site level
// 11/13/2023 Add try and catch in parse web content data from API
// ===========================================================
// ===========================================================

// this g_locale is in en-US format, for Rhythm. 
var g_locale = null;
var g_curUser = null;

// g_addSpace is to control whether adding space before and after the separator 
// in appendKeyText() and stripKeyText() function
// ex. " | " or "|"
var g_addSpace = true;

// Note: Lifeway locale is en_US format.
var g_langDict = {
    'en_US': "eng",
    'fi_FI': 'fin',
    'et_EE': 'est',
    'lt_LT': 'lit',
    'lv_LV': 'lav'
};

var g_customTranslation = null;

/* This spinner is small size.
var g_spinner = "<div class='content spin'>" + 
"<div class='loading-indicator'   aria-live='polite' role='status' style='height: 15px'>" + 
"<div class='animation-container'   style='height:20px; display:contents'>" + 
"  <div class='key' style='height: 8px; transform: rotate(0) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(30deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(60deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(90deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(120deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(150deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(180deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(210deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(240deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(270deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(300deg) translateY(-4px)'></div>" +
"  <div class='key' style='height: 8px; transform: rotate(330deg) translateY(-4px)'></div>" +
"</div>" +
"</div>" +
"</div>";
*/

/* This spinner is regular size */
var g_spinner = "<div class='content spin'>" +
    "<div class='loading-indicator'   aria-live='polite' role='status'>" +
    "<div class='animation-container'>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "  <div class='key'></div>" +
    "</div>" +
    "</div>" +
    "</div>";


//--------------------------------------------------------------
// Get current user info
function getcurUserInfo() {
    let timeoutvar4getcurUserInfo;

    if (g_curUser == null) {

        $.ajax({
            type: 'GET',
            url: "/delegate/ecom-api/users/current",
            success: function (data, status) {
                let myJSON = JSON.stringify(data);

                g_curUser = data;

            },
            error: function (jqXHR, status, err) {
                //console.log("Get current user info Failed");
            }
        }); // end rhythm enpoint call                                                               

    }
    else {
        timeoutvar4getcurUserInfo = setTimeout(getcurUserInfo, 100);
    }
}




//--------------------------------------------------------------
// Get generic and user info
function getGenericInfo() {
    let timeoutvar4getGenericInfo;

    if (currentLocale != null) {

        g_locale = currentLocale.replace('_', '-');


    }
    else {
        timeoutvar4getGenericInfo = setTimeout(getGenericInfo, 100);
    }
}



//--------------------------------------------------------------
// Get GLOBAL custom translation - web content title must be TRANSLATE_CUSTOM
function getCustomTranslation() {

    //getArticle('TRANSLATE_CUSTOM', "global");
    g_customTranslation = getArticle2('TRANSLATE_CUSTOM');

}



//--------------------------------------------------------------
// Call Liferay API to get translations article. This one has no need to pass variable.
function getArticle2(articleName) {
    // - - - - - - - - - - - - - - - - - - - - - - -
    // Call Liferay API to get web content for translation override
    let groupId = Liferay.ThemeDisplay.getScopeGroupId();
    let articleTitle = articleName;
    let returnContent = null;

    $.ajax({
        type: 'GET',
        url: "/delegate/ecom-api/webcontent?articleId=" + articleTitle + "&groupId=" + groupId,
        async: false,
        success: function (data, status) {
            let myJSON = JSON.stringify(data);


            let jsonObj = null;
            try {
                jsonObj = JSON.parse(data);
            }
            catch (error) {
                jsonObj = data;
            }



            returnContent = jsonObj.content;

        },
        error: function (jqXHR, status, err) {

            return null;
        }

    }); // end rhythm enpoint call


    return returnContent;
}




//--------------------------------------------------------------
// Convert date to short date by locale
function convt2ShortDateLocale(datestr) {
    let dateobj = new Date(Date.parse(datestr));
    const options = { year: 'numeric', month: '2-digit', day: 'numeric' };
    return dateobj.toLocaleDateString(g_locale, options);
}



//--------------------------------------------------------------
// Get locale string content from webarticle XML by keyword
function getLocaleContentByKey(xkey) {
    return getLocaleContentByKey2(g_customTranslation, xkey);
}


//--------------------------------------------------------------
// Get locale string content from webarticle XML by keyword
// example of transhtml
/*
              <![CDATA[<translaton id="Translate_ATP_DELDATE">
                             <trans id='atp'>
                                           oletettu toimituspäivä
                             </trans>
                             <trans id='item'>
                                           kohde
                             </trans>
              </translaton>]]>
*/

function getLocaleContentByKey2(xmlstr, xkey) {


    if (xmlstr == null || xkey == null) return "";


    let xmlobj = new window.DOMParser().parseFromString(xmlstr, "text/html");

    let lc = Liferay.ThemeDisplay.getLanguageId();
    let transhtml = $(xmlobj).find("[language-id='" + lc + "']").html();

    // remove <![CDATA[ and ]]>
    let xstart = transhtml.indexOf("[CDATA[");
    let xend = transhtml.indexOf("]]");



    let cdata = transhtml.substring(xstart + 7, xend);

    let xmlobj2 = new window.DOMParser().parseFromString(cdata, "text/html");
    let kstr = "#" + xkey;
    let cxml = $(xmlobj2).find(kstr).html();




    if (cxml == null) {
        //console.log(`Customer Translation Content Key (${xkey}) not found.`);
    }


    // remove \t and \n from the json string.
    cxml = cxml.replace(/(\r\n|\n|\r|\t)/gm, "");




    return cxml;
}



// ------------------------------------------------
// extract and convert text to number with Locale
function convertNbrLocale(txt, locale) {


    let ntxt = "";
    for (let i = 0; i < txt.length; i++) {
        let c = txt.substring(i, i + 1);
        if ((c >= '0' && c <= '9') || c == '.' || c == ',') {
            ntxt += c;
        }
    }



    const { format } = new Intl.NumberFormat(locale);
    const [, decimalSign] = /^0(.)1$/.exec(format(0.1));

    return +ntxt.replace(new RegExp(`[^${decimalSign}\\d]`, 'g'), '').replace(decimalSign, '.');
}



// --------------------------------------------------------------------------------
// insert str1 (source string) to str2 (target string)
// remove duplicates, and adding separator
// and return new string
function appendKeyText(st1, st2, sep1, sep2) {
    // ex.
    // st1 - "abc"
    // st2 - "xyz"
    // return "xyz | abc"
    // if st2 is "xyz | abc | abc | abc | abc"
    // then return "xyz | abc"

    if (st1 == null || st2 == null) {
        return "";
    }

    let tary = st2.split(sep1);

    if (tary.length == 0) {
        return st1;
    }

    // find if st1 already in st2, remove it first
    let fstr = stripKeyText(st1, st2, sep1, sep2);

    let space = "";
    if (g_addSpace) space = " ";

    //  then append st1
    if (fstr != "") {
        fstr += space + sep1 + space;
    }

    fstr += st1;

    return fstr;
}



//--------------------------------------------------
// Get key from text string
function getKeyFromText(st, sep) {
    if (st == null) return "";
    if (sep == null) return st.trim();

    let tary = st.split(sep);
    if (tary.length == 1) return st.trim();
    if (tary.length > 1) return tary[0].trim();
}


//--------------------------------------------------
// check if st1 exists in st2
function keyTextExist(st1, st2, sep1, sep2) {
    if (st1 == null || st2 == null) {
        return false;
    }

    let key = getKeyFromText(st1, sep2);

    let tary = st2.split(sep1);

    if (tary.length == 0) {
        return false;
    }

    for (let i = 0; i < tary.length; i++) {
        let s = tary[i].trim();

        if (sep2 != null) {
            let tary2 = s.split(sep2);
            if (tary2.length > 0) {
                for (let j = 0; j < tary2.length; j++) {

                    let s2 = tary2[j].trim();
                    if (s2 == key) return true;
                }
            }
        }
        else {
            if (s == key) return true;
        }

    }
    return false;

}




//--------------------------------------------------
// strip st1  from st2
function stripKeyText(st1, st2, sep1, sep2) {

    if (st1 == null || st2 == null) {
        return "";
    }

    let tary = st2.split(sep1);

    if (tary.length == 0) {
        return "";
    }

    let fstr = "";
    let c = 0;

    let space = "";
    if (g_addSpace) space = " ";

    // find if st1 (key) already in st2, remove it
    for (let i = 0; i < tary.length; i++) {
        let s = tary[i].trim();

        if (!keyTextExist(st1, s, sep1, sep2)) {
            if (c > 0) fstr += space + sep1 + space;
            fstr += s;
            c++;
        }

    }

    return fstr;
}


//--------------------------------------------------
// get text  from st2 by key
function getTextFromKey(key, st2, sep1, sep2) {
    if (key == null || st2 == null) {
        return "";
    }

    let tary = st2.split(sep1);

    if (tary.length == 0) {
        return "";
    }

    for (let i = 0; i < tary.length; i++) {
        let s = tary[i].trim();

        if (keyTextExist(key, s, sep1, sep2)) {
            let tary2 = s.split(sep2);
            if (tary2.length > 1) {
                return tary2[1];
                break;
            }
        }

    }

    return "";
}



// --------------------------------------------------
// check if the role existe for sellable item checking
function isRoleExisted(role) {
    if (g_curUser == null) return null;

    for (let i = 0; i < g_curUser.roles.length; i++) {

        if (role == g_curUser.roles[i].name) {
            return true;
        }
    }
    return false;
}


//--------------------------------------------------------------
// Call Liferay API to get translations article. This one has no need to pass variable.
// Also, this one is intended to use by retrieving the whole web content and use it right a way.
// It is not for something like <translaton> and <trans> ....
function getArticleX(articleName) {
    // - - - - - - - - - - - - - - - - - - - - - - -
    // Call Liferay API to get web content for translation override
    let groupId = Liferay.ThemeDisplay.getScopeGroupId();
    let articleTitle = articleName;
    let cdata = null;

    $.ajax({
        type: 'GET',
        url: "/delegate/ecom-api/webcontent?articleId=" + articleTitle + "&groupId=" + groupId,
        async: false,
        success: function (data, status) {
            let myJSON = JSON.stringify(data);



            let jsonObj = null;
            try {
                jsonObj = JSON.parse(data);
            }
            catch (error) {
                jsonObj = data;
            }



            let returnContent = jsonObj.content;

            // Extract source of web content response data.
            if (returnContent != null) {
                let xmlobj = new window.DOMParser().parseFromString(returnContent, "text/html");

                let lc = Liferay.ThemeDisplay.getLanguageId();
                let transhtml = $(xmlobj).find("[language-id='" + lc + "']").html();

                // remove <![CDATA[ and ]]>
                let xstart = transhtml.indexOf("[CDATA[");
                let xend = transhtml.indexOf("]]");



                cdata = null;
                try {
                    cdata = transhtml.substring(xstart + 7, xend);
                }
                catch (error) {
                    //console.log("extract cdata error: ", error.message);
                }


            }

        },
        error: function (jqXHR, status, err) {

            return null;
        }

    }); // end rhythm enpoint call

    return cdata;
}



// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
// Initialization
$('document').ready(function () {
    getGenericInfo();
    getcurUserInfo();
    getCustomTranslation();
    fixTwitterIcon();
});
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*

function fixTwitterIcon() {
    var twitterSymbol = document.getElementById("twitter");
    var pathElements = twitterSymbol.getElementsByTagName("path");

    // update svg paths for X, formerly twitter
    if (pathElements.length >= 2) {
        var firstPath = pathElements[0]; // Select the second path element
        var secondPath = pathElements[1]; // Select the second path element

        // new X icon
        const twitterPath = "M3.5-4.5H5L1.7-0.7l3.8,5.1h-3L0.2,1.3l-2.7,3.1H-4l3.5-4l-3.7-4.8h3.1L1-1.7L3.5-4.5L3.5-4.5z M3,3.5h0.8l-5.4-7.1h-0.9L3,3.5z";

        // maintain circle path around icon
        const circlePath = "M0.5-8.9c5,0,9,4,9,9s-4,9-9,9s-9-4-9-9S-4.5-8.9,0.5-8.9z";
        firstPath.setAttribute("d", circlePath);
        secondPath.setAttribute("d", twitterPath);

        // reset viewBox values
        $('#twitter').attr('viewBox', '-9.5 -9.8 20 20');
    }
}

// ===========================================================
// ===========================================================
//  ------ END OF Common Code
// ===========================================================
// ===========================================================


// ===========================================================
// ===========================================================
// Set customer logo in header area for all pages
// Author: Infor
// Date: 4/28/23
// 11/1/2023 Changed to use M3 Translation to lookup web content ID
// ===========================================================
// ===========================================================

var g_crs881_GetTranslData = '/o/generic-api/GetTranslData?mbmd=';

//--------------------------------------------------
function setCustLogo() {
    let timeoutvar4setCustLogo;

    let rhyLogoEle = $('.logotype.signed-in')[0];

    if (rhyLogoEle != null && g_curUser != null) {

        getwebcontentid(g_curUser.activeUserGroup.customerNumber);
    }
    else {
        timeoutvar4setCustLogo = setTimeout(setCustLogo, 250); // check again 
    }

    //timeoutvar4setCustLogo = setTimeout(setCustLogo, 250); // check again 
}


//--------------------------------------------------
// Get web content ID from M3 translation
function getwebcontentid(custnbr) {

    // call m3 api to get logo web content ID
    let apiurl = g_crs881_GetTranslData + custnbr;
    fetch(apiurl, {
        method: "GET"
    })
        .then((res) => res.json())                            //  convert response to json
        .then(function (data) {

            if (data.nrOfSuccessfullTransactions > 0) {
                mvxd = data.results[0].records[0].MVXD;


                if (mvxd != null && mvxd != "") {
                    // get web content
                    getCustLogoWebContent(mvxd);

                }

            }
            else {
                // error
                let errstr = "M3 API-> CRS881MI\n";
                errstr += "Transaction-> " + data.results[0].transaction + "\n";
                errstr += "Error Type-> " + data.results[0].errorType + "\n";
                errstr += "Error Code-> " + data.results[0].errorCode + "\n";
                errstr += "Error Message-> " + data.results[0].errorMessage + "\n";
                errstr += "Error Field-> " + data.results[0].errorField;
                //console.log(errstr);
            }

        })
        .catch(function (error) {
            //console.log(`getwebcontentid(error)->${error}`);

        }); // end rhythm enpoint call     


}


//--------------------------------------------------
// Get cust logo from web content
// 11/1/2023 now the xid is web content ID
function getCustLogoWebContent(xid) {


    // - - - - - - - - - - - - - - - - - - - - - - -
    // Call Liferay API to get web content
    let groupId = Liferay.ThemeDisplay.getScopeGroupId();
    //let articleTitle = mkt.replace(/ /g, "_").toUpperCase();
    let articleTitle = xid.toUpperCase();
    let returnContent = null;

    $.ajax({
        type: 'GET',
        url: "/delegate/ecom-api/webcontent?articleId=" + articleTitle + "&groupId=" + groupId,
        async: true,
        success: function (data, status) {
            let myJSON = JSON.stringify(data);



            let jsonObj = null;
            try {
                jsonObj = JSON.parse(data);
            }
            catch (error) {
                jsonObj = data;
            }



            returnContent = jsonObj.content;

            // Extract cat text content from web content response data.
            if (returnContent != null) {
                let xmlobj = new window.DOMParser().parseFromString(returnContent, "text/html");

                let lc = Liferay.ThemeDisplay.getLanguageId();
                let transhtml = $(xmlobj).find("[language-id='" + lc + "']").html();

                // remove <![CDATA[ and ]]>
                let xstart = transhtml.indexOf("[CDATA[");
                let xend = transhtml.indexOf("]]");



                let cdata = transhtml.substring(xstart + 7, xend);


                // add customer logo
                let logoEle = $('.logotype.signed-in')[0];

                // add element custom css
                $(logoEle).attr('style', 'display: inline-grid');
                $('.dynamic-search.searchmode-detailed.full-width').attr('style', 'width: 80%');

                // insert log web content
                $(logoEle).append(cdata);
            }

        },
        error: function (jqXHR, status, err) {

        }

    }); // end rhythm enpoint call

}


// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
// Page Initialization
$('document').ready(function () {

    // Set customer log in header area for all pages
    setCustLogo();

});
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*

// ===========================================================
// ===========================================================
// END OF Set customer logo in header area for all pages
// ===========================================================
// ===========================================================





// ===========================================================
// ===========================================================
// Set customer footer area for all pages
// Date: 6/27/23
// ===========================================================
// ===========================================================

//--------------------------------------------------
function orderFooterLinks(title) {
    let taxonomy = [];
    taxonomy.push({ title: 'faq-contact-us', sortId: 1, level: 'primary' });
    taxonomy.push({ title: 'helpcenter', sortId: 2, level: 'primary' });
    taxonomy.push({ title: 'mycatalog', sortId: 2, level: 'primary' });
    taxonomy.push({ title: 'services', sortId: 3, level: 'primary' });
    taxonomy.push({ title: 'about-us', sortId: 4, level: 'primary' });
    taxonomy.push({ title: 'trimark-usa-locations', sortId: 5, level: 'primary' });
    taxonomy.push({ title: 'careers', sortId: 6, level: 'primary' });

    var pageMatch = {};
    var match = taxonomy.map(page => {
        if (title === page.title) {
            pageMatch = page;
        }
    });
    return pageMatch;
}

function getFooterLinks() {
    // --- Get footer links ---
    var footerMenuArray = [];
    listItems = $(".dynamic-menu-footer ul li").find("a").each(function (i) {
        let menuItem = {};
        var page = $(this)[0];
        menuItem.href = $(page).attr('href');
        menuItem.title = $(page)[0].innerText;
        footerMenuArray.push(menuItem);
        var str = menuItem.href.replace(window.origin + "/", "");

        if (Object.keys(orderFooterLinks(str)).length) {
            menuItem.sortId = orderFooterLinks(str).sortId;
            menuItem.level = orderFooterLinks(str).level;
        } else {
            menuItem.sortId = 0;
            menuItem.level = 'secondary';
        }
    });
    return footerMenuArray;
}

getSortedLinks = (level, links) => {
    return links.filter(page => {
        return page.level === level
    }).sort((a, b) => a.sortId - b.sortId);
}

setFooterHtml = (links) => {
    footerHtml = $('<div id="tm-footer"><div id="logo"><!-- logo --></div><div id="primary-links"><!-- primary --></div><div id="secondary-links"><!-- secondary --></div><div id="social-media"><!-- primary --></div><div id="tm-address"><!-- address--></div><div id="copyright"><!-- copyright --></div></div>');
    footerHtml.prependTo($('.dynamic-menu-footer'));

    primaryLinks = getSortedLinks('primary', links);
    secondaryLinks = getSortedLinks('secondary', links);

    primaryHtml = '';
    secondaryHtml = '';
    primaryLinks.map(link => {
        primaryHtml += `<div class="primary-link-cell"><a href=${link.href}>${link.title}</a></div>`;
    });

    secondaryLinks.map(link => {
        secondaryHtml += `<div class="secondary-link-cell"><a href=${link.href} target="_blank">${link.title}</a> </div> | `;
    });

    socialMedia = $('.footer-social-media-wrapper')[0];

    // add target to open sm in new window
    $('.social-media-link').attr('target', '_new');

    address = '<span>TriMark USA LLC</span><span>9 Hampshire Street</span><span>Mansfield, MA 02048</span><span>P: 888.288.5346</span>';
    copyright = '<span>Copyright &copy; 2024  TriMark. All Rights Reserved.</span>';

    logoImg = '<a href=https://www.trimarkusa.com><img src="/documents/24337183/24339947/trimark-logo-232.png" /></a>';

    // insert footer elements one at a time
    $(logoImg).prependTo($('.dynamic-menu-footer #logo'));
    $(primaryHtml).prependTo($('#primary-links'));
    $(secondaryHtml).prependTo($('#secondary-links'));
    $(socialMedia).prependTo($('#social-media'));
    $(address).prependTo($('#tm-address'));
    $(copyright).prependTo($('#copyright'));
}

// ===========================================================
// ===========================================================
// END OF Set customer footer area for all pages
// ===========================================================
// ===========================================================

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
// Page Initialization
$('document').ready(function () {

    setTimeout(function () {
        setFooterHtml(getFooterLinks());
    }, 500);

    // Construct and show global footer

});
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*


// add white logo to banner
$(".main-nav-wrapper").append("<div class='trimarketplace-logo-white'><a href='/my-account'><img src='https://qa.trimarketplace.com/documents/18586322/20080704/TriMarketPlace-logo-white.png'  /></a></div>");