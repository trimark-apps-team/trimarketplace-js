$(window).on('load', function () {
    // sometimes take a few seconds for statuses to load in DOM
    setTimeout(setStatusColor, 0);
});

addEventListener("DOMNodeInserted", (event) => {
    setStatusColor();
});

setStatusColor = () => {
    $('.order-list-order-status').each(function (index, item) {
        if (item.innerText === "Approved") {
            item.style.color = "#198E56"; //TM Green
        } else if (item.innerText === "Pending") {
            item.style.color = "#C9AA10";
        } else if (item.innerText === "Rejected") {
            item.style.color = "#C03326";
        }
    });
}

/* 
FedEx fix
separate FedEx tracking numbers that are coming back chained together */
const getCarrierDiv = (id, carrier) => {
    return `<div class="delivery-tracking-number" style="text-align:left"><span class="courrier-name">${ carrier } </span><a href="https://www.fedex.com/wtrk/track/?trknbr=${id}" target="_blank" class="link-primary tracking-number" style="width: 150px">${id}<svg class="icon external-link" focusable="false"><use xlink:href="#external-link"></use></svg></a></div>`
}

/* split the trackingnumber list and reaplce with individual numbers */
const separateTrackingLink = (trackingLink, carrier, trackingContainer) => {
    const trackingArray = $(trackingLink).text().trim().split("|");
    var trackingDiv = "";

    $(trackingArray).map((id)=> {
        // create new html to replace the tracking code div
        trackingDiv+=getCarrierDiv( $(trackingArray)[id], $(carrier).text() );
    });

    // innerHTML replacement
    $(trackingContainer).html( trackingDiv );
}

/* check for chained tracking numbers and separate them */
const fixTrackingCode = () => {
    const trackingContainerArray = $(".tracking-number-container");

    // loop through tracking divs
    trackingContainerArray.map((i) => {
        const trackingNumberDiv = $(".tracking-number-container")[i];
        const trackingLink = $(trackingNumberDiv).children(0).children(0)[1];
        const carrier = $(trackingNumberDiv).children(0).children(0)[0];
        const trackingContainer = $(".tracking-number-container").closest(".delivery-tracking-container");

        // identify tracking numbers from api separated by pipe
        if ( $(trackingLink).text().includes("|") ) {
            separateTrackingLink(trackingLink, carrier, trackingContainer);
        }
    });
};

const startObserver = () => {
  // Observer configuration and callback
    const config = { childList: true, characterData: false, subtree: true, attributes: false };
    const callback = function (mutationsList, observer) {
        // will trigger when accordian node is expanded
        fixTrackingCode();
    };

    const observer = new MutationObserver(callback);
    var targetNode = document.body;
    if (targetNode) {
        observer.observe(targetNode, config);
    }
}

(function () {
    startObserver();
})();
