const splitTrackingNumbers = () => {
    let trackingNumber = $(".link-primary.tracking-number");

    // Check if tracking number link exists
    if (trackingNumber.length) {

        // Initialize an empty string to store new tracking links
        let trackingLinks = "";

        // Extract text content of the first tracking number link
        let trackingNumberEl = trackingNumber[0];
        let trackingNumberText = $(trackingNumberEl).text().trim();

        // Split the tracking number text into an array
        let trackingNumberArray = trackingNumberText.split("|");

        // Iterate through each tracking number in the array
        // ignore if this has already been ordered
        if (!$(trackingNumberEl).hasClass("reordered")) {
            // Hide all existing tracking number links
            $(".tracking.item.order-aspect a").hide();

            trackingNumberArray.forEach(trackingNumber => {

                // Append a new tracking link to the trackingLinks string
                trackingLinks += `<div style="margin-top: 10px;">
                   <a href="https://www.aaacooper.com/pwb/Dashboard.aspx?id=${trackingNumber}&PG=PickupNumber" target="_blank" class="link-primary tracking-number">${trackingNumber}
                       <svg class="icon external-link" focusable="false">
                           <use xlink:href="#external-link"></use>
                       </svg>
                   </a>
               </div>`;
                $(trackingNumberEl).addClass("reordered");
            });

            // Append the new tracking links to the existing tracking element
            $(".tracking.item.order-aspect").append(trackingLinks);
        }
    }
}

// Observer configuration and callback
const config = { childList: true, characterData: false, subtree: true, attributes: false };
const callback = function (mutationsList, observer) {
    splitTrackingNumbers();
};

const observer = new MutationObserver(callback);
var targetNode = document.body;

if (targetNode) {
    observer.observe(targetNode, config);
}