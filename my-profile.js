const setUserEmail = () => {
    const userEmail = Liferay.ThemeDisplay.getUserEmailAddress();

    if (!$('.user-email').length) {
        $('.user-component-container:first').append(`<div class='user-email'><span>Email:</span> ${userEmail}</div>`);
    }
}

// define the target node
var targetNode = document.body;

// configuration of the observer
const config = { childList: true, characterData: true, subtree: true, attributes: true, };

// callback function
const callback = function (mutationsList, observer) {
    hideExtraAddresses();
    setUserEmail();
};
// Create observer instance
const observer = new MutationObserver(callback);

// pass in the target node and configuration observer.observe(targetNode, config);
if (targetNode) {
    observer.observe(targetNode, config);
}

hideExtraAddresses = () => {
    if (!$(".shipping-content").hasClass("expanded")) {
        $(".content-toggler").click().hide();
        $(".shipping-content").addClass("expanded");
        $(".header-content").hide();
        $("#user-favorite-icon").hide();
    }
}

$(document).ready(function () {

    hideExtraAddresses();
});