// ===========================================================
// Prevent special characters in quantity input
// ===========================================================
window.addQuantityListener = () => {
    $('.quantity > .input-text').off('input').on('input', function () {
        $(this).val($(this).val().replace(/[^a-z0-9]/gi, ''));
    });
};

// Attach listener on DOM changes
addEventListener("DOMNodeInserted", () => {
    window.addQuantityListener();
});

// ===========================================================
// Set placeholder text for item number inputs
// ===========================================================
window.setItemInput = () => {
    $(".item-number-input, .0-item-number-input").attr("placeholder", "Item#");
};

// Attach listener on DOM changes
addEventListener("DOMNodeInserted", () => {
    window.setItemInput();
});

// ===========================================================
// Add thank-you note and placeholders on window load
// ===========================================================
$(window).on('load', function () {
    // Set placeholders
    window.setItemInput();

    // Append thank-you message once
    if (!$(".cart-orderlines-region .thank-you-box").length) {
        $(".cart-orderlines-region").append(`
            <div class="content-box thank-you-box" style="margin-bottom: 10px; border-radius: 0px;">
                <div class="content">
                    <h4 style="text-align: center; padding-bottom: 10px;">Thank you for your business!</h4>
                    <p class="minimum" style="text-align: center;">
                        Minimum $350 order before tax (anything under the minimum is subject to a $25 charge),
                    </p>
                    <p class="minimum" style="text-align: center;">
                        unless alternate shipping rates have been previously agreed to in your contract.
                    </p>
                    <p class="note" style="text-align: center; font-weight: bold;">
                        Please note that shipping charges are not included and will be calculated prior to shipment.
                    </p>
                </div>
            </div>
        `);
    }

    // Initialize quantity listener
    window.addQuantityListener();
});
