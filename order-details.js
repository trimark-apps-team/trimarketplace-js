// ===========================================================
// Split chained tracking numbers into individual links
// ===========================================================
window.splitTrackingNumbers = () => {
    const trackingNumberEl = $(".link-primary.tracking-number").first();

    // Check if the tracking number element exists
    if (trackingNumberEl.length) {
        const trackingNumberText = trackingNumberEl.text().trim();
        const trackingNumberArray = trackingNumberText.split("|");

        // Only process if this hasn't been reordered yet
        if (!trackingNumberEl.hasClass("reordered")) {
            // Hide all existing tracking number links
            $(".tracking.item.order-aspect a").hide();

            // Generate individual tracking link divs
            const trackingLinks = trackingNumberArray.map(trk => {
                return `
                    <div style="margin-top: 10px;">
                        <a href="https://www.fedex.com/fedextrack/?trknbr=${trk}" target="_blank" class="link-primary tracking-number">
                            ${trk}
                            <svg class="icon external-link" focusable="false">
                                <use xlink:href="#external-link"></use>
                            </svg>
                        </a>
                    </div>
                `;
            }).join("");

            // Mark as reordered
            trackingNumberEl.addClass("reordered");

            // Append the new tracking links
            $(".tracking.item.order-aspect").append(trackingLinks);
        }
    }
};

// ----------------------
// MutationObserver
// ----------------------
window.startTrackingObserver = () => {
    const targetNode = document.body;
    const config = { childList: true, characterData: false, subtree: true, attributes: false };

    const callback = () => {
        window.splitTrackingNumbers();
    };

    const observer = new MutationObserver(callback);

    if (targetNode) {
        observer.observe(targetNode, config);
    }
};

// ----------------------
// Initialize on load
// ----------------------
$(document).ready(() => {
    window.splitTrackingNumbers();
    window.startTrackingObserver();
});
