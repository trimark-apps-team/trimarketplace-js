// ===========================================================
// Order Status and Tracking Fixes - Window Scoped
// ===========================================================

// ----------------------
// Set status color for order statuses
// ----------------------
window.setStatusColor = () => {
    $('.order-list-order-status').each(function (index, item) {
        if (item.innerText === "Approved") item.style.color = "#198E56"; // TM Green
        else if (item.innerText === "Pending") item.style.color = "#C9AA10"; // Yellow
        else if (item.innerText === "Rejected") item.style.color = "#C03326"; // Red
    });
};

// Trigger on page load and DOM updates
$(window).on('load', () => {
    setTimeout(window.setStatusColor, 0);
});

window.addEventListener("DOMNodeInserted", () => {
    window.setStatusColor();
});

// ----------------------
// FedEx / Carrier Tracking Fix
// ----------------------

// Create a carrier tracking div
window.getCarrierDiv = (id, carrier) => {
    return `<div class="delivery-tracking-number" style="text-align:left">
        <span class="courrier-name">${carrier}</span>
        <a href="https://www.fedex.com/wtrk/track/?trknbr=${id}" target="_blank" class="link-primary tracking-number" style="width: 150px">
            ${id}
            <svg class="icon external-link" focusable="false">
                <use xlink:href="#external-link"></use>
            </svg>
        </a>
    </div>`;
};

// Split chained tracking numbers and replace with individual numbers
window.separateTrackingLink = (trackingLink, carrier, trackingContainer) => {
    const trackingArray = $(trackingLink).text().trim().split("|");
    let trackingDiv = "";

    trackingArray.forEach(id => {
        trackingDiv += window.getCarrierDiv(id, $(carrier).text());
    });

    $(trackingContainer).html(trackingDiv);
};

// Fix tracking codes in the DOM
window.fixTrackingCode = () => {
    $(".tracking-number-container").each((i, trackingNumberDiv) => {
        const trackingLink = $(trackingNumberDiv).find('a.tracking-number')[0];
        const carrier = $(trackingNumberDiv).find('span.courrier-name')[0];
        const trackingContainer = $(trackingNumberDiv).closest(".delivery-tracking-container");

        if ($(trackingLink).text().includes("|")) {
            window.separateTrackingLink(trackingLink, carrier, trackingContainer);
        }
    });
};

// ----------------------
// Start MutationObserver to watch for dynamic DOM changes
// ----------------------
window.startObserver = () => {
    const config = { childList: true, characterData: false, subtree: true, attributes: false };
    const observer = new MutationObserver(() => {
        window.fixTrackingCode();
    });

    observer.observe(document.body, config);
};

// Immediately initialize observer
window.startObserver();
