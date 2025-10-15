// ===========================================================
// TriMark Marketplace - Checkout & Abandon Cart JS (Window Scoped)
// ===========================================================

window.getCartId = function() {
    var urlString = window.location.hash;
    var queryPart = urlString.split('?')[1];

    if (queryPart) {
        var queryParams = queryPart.split('&');
        for (var i = 0; i < queryParams.length; i++) {
            var keyValue = queryParams[i].split('=');
            if (keyValue[0] === 'id') return keyValue[1];
        }
    }
    return "";
};

window.setErrorMessage = function() {
    var errorMessageEl = $(".erp-failure-modal")[0];
    var modalSection = $(".bbm-modal-section")[0];
    try {
        if ($(errorMessageEl)) {
            var errorMessageTopBar = $(errorMessageEl).find("h2");
            var refreshMessage = $(modalSection).find("h3");
            $(errorMessageTopBar).text("Unable to process this order. Please contact your Sales Representative for more information.");
            $(refreshMessage).text("");
            var refreshButton = $(".refresh-button");
            if (refreshButton) refreshButton.hide();

            $(".btn-wrapper").css({ display: "block", textAlign: "right" });
            $(".btn-close-modal").css({ width: "auto" });
        }
    } catch (err) {
        console.error(err);
    }
};

window.setRoleView = function() {
    $.get("/delegate/ecom-api/users/current/", function(data) {
        var admin = data.roles.find((role) => role.name.includes("Approver"));
        if (admin) {
            $(".address-controls").addClass("approver");
            $(".shipping-addresses-selection").addClass("approver");
        } else {
            $("#default-address").hide();
        }
    });
};

// ===========================================================
// Document Ready
// ===========================================================
$(document).ready(function() {

    window.hasEquipmentTrue = false;
    window.hasEquipmentFalse = false;

    window.equipShippingDiv = $('<div id="shipping-error" style="color:#A12641; padding-bottom:10px; font-weight:600;">Your order contains equipment and non-equipment items. Please go back to update cart.</div>');

    sessionStorage.removeItem('transactionalEmailSent');
    sessionStorage.removeItem('triggerAbandonCart');

    // --------- MutationObserver ------------//
    window.checkoutMutationCallback = function(mutationsList, observer) {
        $.get("/delegate/ecom-api/users/current", function(data) {
            if (data.isMultiCompanyUser) $(".shipping-addresses-selection").addClass('groupUser');
        });

        window.setRoleView();
        window.setErrorMessage();

        if (window.hasEquipmentTrue && window.hasEquipmentFalse) {
            var isDisabled = $(".btn.continue").prop('disabled');
            if (!isDisabled) {
                // $(".btn.continue").prop("disabled", true);
            }

            if ($("#shipping-error").length === 0) {
                // $("footer.btn-wrapper").prepend(window.equipShippingDiv);
            }
        }

        if (window.hasEquipmentTrue) {
            var input = $('#yourReference');
            if (input && input.val() === "") {
                input.val("equipment |").change();
            }
        }
    };

    window.checkoutObserver = new MutationObserver(window.checkoutMutationCallback);
    window.checkoutObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

    // --------- Check Cart for Equipment ---------//
    var cartId = window.getCartId();
    if (cartId) {
        $.ajax({
            url: `/delegate/ecom-api/orders/approval/${cartId}/payment`,
            type: "PUT",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ "paymentMethodId": "1" }),
            xhrFields: { withCredentials: true },
            success: function(response) {
                response.orderLines.forEach(function(line) {
                    $.get(`/delegate/ecom-api/items/${line.item.itemNumber}/attributes?size=-1`, function(data) {
                        var hasEquip = data.some(att => att.key === "PMDM.AT.EquipmentFlag" && att.values?.length);
                        if (hasEquip) window.hasEquipmentTrue = true;
                        else window.hasEquipmentFalse = true;
                    });
                });
            }
        });
    } else {
        // Not approval order, just checkout
        $.get("/delegate/ecom-api/orders/current/", function(data) {
            data.orderLines.forEach(function(line) {
                $.get(`/delegate/ecom-api/items/${line.item.itemNumber}/attributes?size=-1`, function(data) {
                    var hasEquip = data.some(att => att.key === "PMDM.AT.EquipmentFlag" && att.values?.length);
                    if (hasEquip) window.hasEquipmentTrue = true;
                    else window.hasEquipmentFalse = true;
                });
            });
        });
    }

    // --------- Checkout Page Observer ---------//
    window.checkoutConfirmationObserver = new MutationObserver(function() {
        var confirmation = $('.checkout-container .confirmation-container');
        var reviewContainer = $(".checkout-container .review-container");
        var salesEmail = sessionStorage.getItem('salesEmail');
        var customerEmail = sessionStorage.getItem('customerEmail');
        var customerNumber = sessionStorage.getItem('customerNumber');
        var companyName = sessionStorage.getItem('companyName');

        if (window.location.href.includes("qa.trimarketplace.com")) {
            salesEmail = "kevin.kindorf@trimarkusa.com";
            customerEmail = "kevin.kindorf@trimarkusa.com";
        }

        if (confirmation.length && !sessionStorage.getItem('transactionalEmailSent')) {
            sessionStorage.setItem('transactionalEmailSent', true);

            $.ajax({
                url: 'https://eba-rhythm.trimarketplace.com/post-to-hubspot',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "emailId": "170878458282",
                    "message": { "to": salesEmail, "from": "support@trimarkusa.com", "cc": ["demo_support@trimarkusa.com"] },
                    "customProperties": {
                        "customerEmail": customerEmail,
                        "customerNumber": customerNumber,
                        "companyName": companyName,
                        "cart_total": parseFloat($(".order-summary-component .total .amount").text().replace(/[^.0-9]/g, '') || 0).toFixed(2),
                        "cart": sessionStorage.getItem('checkout_items_hubspot')
                    }
                })
            });
        }

        if (reviewContainer.length && window.location.href.includes('checkoutpage/review')) {
            $(".thank-you-container").show();
        }
    });

    window.checkoutConfirmationObserver.observe(document.body, { childList: true, subtree: true });

    // --------- Interval for Abandoned Cart ---------//
    window.abandonCartInterval = window.setInterval(function() {
        if (sessionStorage.getItem('checkout_items_hubspot')) {
            var customerEmail = sessionStorage.getItem('customerEmail');
            if (window.location.href.includes('qa.trimarketplace.com')) customerEmail = 'kevin.kindorf@trimarkusa.com';

            $.ajax({
                url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                type: 'patch',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "properties": {
                        "rhythm_abandoned_cart": "true",
                        "rhythm_abandoned_cart_total": parseFloat(sessionStorage.getItem('checkout_value')).toFixed(2),
                        "rhythm_cart_items": sessionStorage.getItem('checkout_items_hubspot')
                    }
                }),
                success: function() {
                    sessionStorage.setItem('triggerAbandonCart', true);
                    clearInterval(window.abandonCartInterval);
                }
            });
        }
    }, 200);
});
