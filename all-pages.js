// ===========================================================
// TriMark Marketplace - Site-wide JS with Customer Logo
// Author: Consolidated
// Date: 10/15/2025
// ===========================================================

// ===========================================================
// Accessible Tool
// ===========================================================
window.loadAccessibeTool = function () {
    window.s = document.createElement('script');
    window.h = document.querySelector('head') || document.body;
    window.s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
    window.s.async = true;
    window.s.onload = function () {
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
    window.h.appendChild(window.s);
};
window.loadAccessibeTool();

// ===========================================================
// Global Variables and Common Functions
// ===========================================================
window.g_locale = null;
window.g_curUser = null;
window.g_addSpace = true;
window.g_customTranslation = null;

window.g_langDict = {
    'en_US': "eng",
    'fi_FI': 'fin',
    'et_EE': 'est',
    'lt_LT': 'lit',
    'lv_LV': 'lav'
};

window.g_spinner = "<div class='content spin'><div class='loading-indicator' aria-live='polite' role='status'><div class='animation-container'>" +
    "<div class='key'></div>".repeat(12) +
    "</div></div></div>";

// Get current user info
window.getcurUserInfo = function () {
    if (!window.g_curUser) {
        $.ajax({
            type: 'GET',
            url: "/delegate/ecom-api/users/current",
            success: function (data) { window.g_curUser = data; },
            error: function () {}
        });
    } else {
        setTimeout(window.getcurUserInfo, 100);
    }
};

// Get generic info / locale
window.getGenericInfo = function () {
    if (window.currentLocale) {
        window.g_locale = currentLocale.replace('_', '-');
    } else {
        setTimeout(window.getGenericInfo, 100);
    }
};

// Get custom translation
window.getCustomTranslation = function () {
    window.g_customTranslation = window.getArticle2('TRANSLATE_CUSTOM');
};

// Fetch Liferay webcontent article
window.getArticle2 = function (articleName) {
    let groupId = Liferay.ThemeDisplay.getScopeGroupId();
    let returnContent = null;
    $.ajax({
        type: 'GET',
        url: "/delegate/ecom-api/webcontent?articleId=" + articleName + "&groupId=" + groupId,
        async: false,
        success: function (data) {
            let jsonObj = null;
            try { jsonObj = JSON.parse(data); } catch (e) { jsonObj = data; }
            returnContent = jsonObj.content;
        },
        error: function () { return null; }
    });
    return returnContent;
};

// ===========================================================
// Customer Footer & White Logo
// ===========================================================
window.insertCustomerFooter = function () {
    let domain = window.location.hostname.includes("qa") ? "https://qa.trimarketplace.com" : "https://shop.trimarketplace.com";
    const year = new Date().getFullYear();
    const footerHTML = `<div id="global-trimarkusa-footer">
        <div class="footer-top">
            <div class="footer-top-body">
                <div class="contact-banner">
                    <div class="logo">
                        <a href="${domain}/login" aria-label="TriMark Home">
                            <img width="170" src="https://docs.trimarkusa.com/hubfs/trimark-logo-hubspot.png" alt="TriMark" />
                        </a>
                    </div>
                    <a href="tel:8882885346" class="phone"><i class="fa fa-phone"></i> (888) 288-5346</a>
                    <div class="email"><i class="fa fa-envelope"></i><a href="mailto:trimarketplacesupport@trimarkusa.com">trimarketplacesupport@trimarkusa.com</a></div>
                    <nav class="social"><ul>
                        <li class="social-icon"><a href="https://www.facebook.com/TrimarkUSA" target="_new"><svg class="icon facebook"><use xlink:href="#facebook"></use></svg></a></li>
                        <li class="social-icon"><a href="https://twitter.com/TriMarkUSA" target="_new"><svg class="icon twitter"><use xlink:href="#twitter"></use></svg></a></li>
                        <li class="social-icon"><a href="http://linkedin.com/company/trimarkusa/" target="_new"><svg class="icon linkedin"><use xlink:href="#linkedin"></use></svg></a></li>
                        <li class="social-icon"><a href="https://www.youtube.com/channel/UC-_N3m1fOpMpdFTldZyKMvA" target="_new"><svg class="icon youtube"><use xlink:href="#youtube"></use></svg></a></li>
                        <li class="social-icon"><a href="https://www.instagram.com/trimarkusa/" target="_new"><svg class="icon instagram"><use xlink:href="#instagram"></use></svg></a></li>
                        <li class="social-icon"><a href="https://www.pinterest.com/TriMarkUSA/" target="_new"><svg class="icon pinterest"><use xlink:href="#pinterest"></use></svg></a></li>
                    </ul></nav>
                </div>
                <div class="link-wrapper">
                    <div class="link-columns">
                        <nav class="link-column">
                            <p class="column-head">Company</p>
                            <ul>
                                <li class="link"><a href="${domain}/about-us" target="_blank">About Us</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/where-we-serve" target="_blank">Locations</a></li>
                                <li class="link"><a href="https://support.trimarketplace.com/en/knowledge" target="_blank">FAQs</a></li>
                            </ul>
                        </nav>
                        <nav class="link-column">
                            <p class="column-head">Legal</p>
                            <ul>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-Website-Terms-of-Use-2-27-23.pdf" target="_blank">Terms of Use</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/Trimark-Code-Of-Business-Ethics-and-Conduct.pdf" target="_blank">Code of Business Ethics and Conduct</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-Terms-of-Design.pdf" target="_blank">Terms of Design<svg class="icon external-link"><use xlink:href="#external-link"></use></svg></a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-USA-Site-Privacy-Policy.pdf" target="_blank">Privacy Policy</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-California-Privacy-Notice-07-21-2022.pdf" target="_blank">California Privacy Notice</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-Terms-and-Conditions-of-Sale.pdf" target="_blank">Terms of Sale</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-Terms-of-Purchase.pdf" target="_blank">Terms of Purchase</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/2022_TriMark_Trademarks.pdf" target="_blank">TriMark USA Trademarks</a></li>
                                <li class="link"><a href="https://docs.trimarkusa.com/hubfs/SiteMedia/SiteResources/Terms/TriMark-Supplier-Code-of-Conduct.pdf" target="_blank">Supplier Code of Conduct</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-bottom"><div class="footer-bottom-wrapper"><address>TriMark USA, LLC, 9 Hampshire Street, Mansfield, MA 02048</address><p>Copyright © ${year}, All Rights Reserved.</p></div></div>
    </div>`;

    const footerObserver = new MutationObserver(() => {
        const mainContent = document.querySelector("main#content");
        if (mainContent && !document.querySelector('#global-trimarkusa-footer')) {
            mainContent.insertAdjacentHTML("afterend", footerHTML);
        }
    });

    footerObserver.observe(document.body, { childList: true, subtree: true });
};

// Append white logo in nav
window.appendWhiteLogo = function () {
    $(".main-nav-wrapper").append("<div class='trimarketplace-logo-white'><a href='/my-account'><img src='https://qa.trimarketplace.com/documents/18586322/20080704/TriMarketPlace-logo-white.png' /></a></div>");
};

// ===========================================================
// Customer-specific Logo
// ===========================================================
window.g_crs881_GetTranslData = '/o/generic-api/EXT881MI_GetTranslData?mbmd=';

window.setCustLogo = function () {
    let rhyLogoEle = $('.logotype.signed-in')[0];
    if (rhyLogoEle && window.g_curUser) {
        window.getwebcontentid(window.g_curUser.activeUserGroup.customerNumber);
    } else {
        setTimeout(window.setCustLogo, 250);
    }
};

window.getwebcontentid = function (custnbr) {
    let apiurl = window.g_crs881_GetTranslData + custnbr;
    fetch(apiurl)
        .then(res => res.json())
        .then(function (data) {
            if (data.nrOfSuccessfullTransactions > 0) {
                let mvxd = data.results[0].records[0].MVXD;
                if (mvxd) window.getCustLogoWebContent(mvxd);
            }
        })
        .catch(function () {});
};

window.getCustLogoWebContent = function (xid) {
    let groupId = Liferay.ThemeDisplay.getScopeGroupId();
    $.ajax({
        type: 'GET',
        url: "/delegate/ecom-api/webcontent?articleId=" + xid.toUpperCase() + "&groupId=" + groupId,
        async: true,
        success: function (data) {
            let jsonObj = null;
            try { jsonObj = JSON.parse(data); } catch (e) { jsonObj = data; }
            let returnContent = jsonObj.content;
            if (returnContent) {
                let xmlobj = new window.DOMParser().parseFromString(returnContent, "text/html");
                let lc = Liferay.ThemeDisplay.getLanguageId();
                let transhtml = $(xmlobj).find("[language-id='" + lc + "']").html();
                let xstart = transhtml.indexOf("[CDATA[");
                let xend = transhtml.indexOf("]]");
                let cdata = transhtml.substring(xstart + 7, xend);
                let logoEle = $('.logotype.signed-in')[0];
                $(logoEle).attr('style', 'display: inline-grid').append(cdata);
                $('.dynamic-search.searchmode-detailed.full-width').attr('style', 'width: 80%');
            }
        }
    });
};

// ===========================================================
// Pending Approvals
// ===========================================================
window.checkPendingApprovalsAllPages = function() {
    $.get("/delegate/ecom-api/orders/approval?size=2&forApproval=true&status=pen", function(data) {
        let customerEmail = sessionStorage.getItem('customerEmail');
        if(window.location.href.includes('qa.trimarketplace.com')) customerEmail = 'kevin.kindorf@trimarkusa.com';
        const approvalResponseList = data.orderForApprovalResponse;
        let hasPendingApproval = approvalResponseList && approvalResponseList.some(a => a.approveStatus === "Pending") ? "true" : "false";
        $.ajax({
            url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
            type: 'PATCH',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ "properties": { "rhythm_approver_notify": hasPendingApproval } }),
            success: function() {
                sessionStorage.setItem('triggerPendingApproval', hasPendingApproval);
                sessionStorage.setItem('pendingApprovalCount', approvalResponseList ? approvalResponseList.length : 'none');
            }
        });
    });
};

window.approvalDetsObserver = new MutationObserver(() => {
    const rejectOrderTitle = $(".bbm-modal-title");
    const proceedToReject = $('.bbm-modal-content .btn-wrapper .btn-proceed');
    if (rejectOrderTitle.text() === "Reject Order") {
        $(proceedToReject).unbind().click(() => setTimeout(window.checkPendingApprovalsAllPages, 500));
    }
});
window.approvalDetsObserver.observe(document.body, { childList: true, subtree: true });

// ===========================================================
// Document Ready Initialization
// ===========================================================
$(document).ready(function() {
    window.getGenericInfo();
    window.getcurUserInfo();
    window.getCustomTranslation();
    window.insertCustomerFooter();
    window.appendWhiteLogo();
    window.setCustLogo();
});
