// ===========================================================
// User Email and Shipping Address Display Fix
// ===========================================================

// Set user email in the UI
window.setUserEmail = () => {
    const userEmail = window.Liferay?.ThemeDisplay?.getUserEmailAddress?.() ?? "";

    if (!$('.user-email').length) {
        $('.user-component-container:first').append(
            `<div class='user-email'><span>Email:</span> ${userEmail}</div>`
        );
    }
};

// Hide extra addresses and expand shipping content
window.hideExtraAddresses = () => {
    const shippingContent = $(".shipping-content");
    if (!shippingContent.hasClass("expanded")) {
        $(".content-toggler").click().hide();
        shippingContent.addClass("expanded");
        $(".header-content").hide();
        $("#user-favorite-icon").hide();
    }
};

// ----------------------
// MutationObserver
// ----------------------
window.addUserEmailObserver = () => {
    const targetNode = document.body;
    const config = { childList: true, characterData: true, subtree: true, attributes: true };

    const callback = (mutationsList, observer) => {
        window.hideExtraAddresses();
        window.setUserEmail();
    };

    const observer = new MutationObserver(callback);

    if (targetNode) {
        observer.observe(targetNode, config);
    }
};

// ----------------------
// Document Ready
// ----------------------
$(document).ready(() => {
    window.hideExtraAddresses();
    window.setUserEmail();
    window.addUserEmailObserver();
});
