// Function to get cart ID from URL hash
const getCartId = () => {
    const urlString = window.location.hash;
    const queryPart = urlString.split('?')[1];
    
    if (queryPart) {
        const queryParams = queryPart.split('&');
        for (const param of queryParams) {
            const [key, value] = param.split('=');
            if (key === 'id') return value;
        }
    }
    return "";
};

// Function to set error message in modal
const setErrorMessage = () => {
    try {
        const errorMessageEl = $(".erp-failure-modal")[0];
        const modalSection = $(".bbm-modal-section")[0];
        if (errorMessageEl) {
            $(modalSection).find("h3").text("");
            const refreshButton = $(".refresh-button");
            if (refreshButton) {
                refreshButton.hide();
                $(".btn-wrapper").css({ display: "block", textAlign: "right" });
                $(".btn-close-modal").css({ width: "auto" });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

// Function to update role-based UI adjustments
const setRoleView = () => {
    $.get("/delegate/ecom-api/users/current/", function (data) {
        const isAdmin = data.roles.some(user => user.name.includes("Approver"));
        if (isAdmin) {
            $(".address-controls, .shipping-addresses-selection").addClass("approver");
        } else {
            $("#default-address").hide();
        }
    });
};

$(document).ready(function () {
    let hasEquipmentTrue = false;
    let hasEquipmentFalse = false;
    const equipShippingDiv = $('<div id="shipping-error" style="color:#A12641; padding-bottom:10px; font-weight:600;">Your order contains equipment and non-equipment items. Please go back to update cart.</div>');
    sessionStorage.removeItem('transactionalEmailSent');
    sessionStorage.removeItem('triggerAbandonCart');

    // MutationObserver to track DOM changes
    const observer = new MutationObserver(() => {
        $.get("/delegate/ecom-api/users/current", function (data) {
            if (data.isMultiCompanyUser) {
                $('.shipping-addresses-selection').addClass('groupUser');
            }
        });
        setRoleView();
    });
    observer.observe(document.body, { childList: false, characterData: false, subtree: true, attributes: true });

    const idValue = getCartId();
    if (idValue) {
        // Make API call for order approval payment
        $.ajax({
            url: `/delegate/ecom-api/orders/approval/${idValue}/payment`,
            headers: { "accept": "application/json", "content-type": "application/json" },
            type: "PUT",
            dataType: "json",
            data: JSON.stringify({ "paymentMethodId": "1" }),
            crossDomain: true,
            xhrFields: { withCredentials: true },
            success: function (response) {
                response.orderLines.forEach(line => {
                    $.get(`/delegate/ecom-api/items/${line.item.itemNumber}/attributes?size=-1`, function (data) {
                        const hasEquipment = data.some(att => att.key === "PMDM.AT.EquipmentFlag" && att.values?.length);
                        hasEquipment ? hasEquipmentTrue = true : hasEquipmentFalse = true;
                    });
                });
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }

    // Interval to check for checkout confirmation page and append survey
    const intervalId = setInterval(() => {
        const checkoutConfirmationPage = $('.checkout-container .confirmation-container');
        if (checkoutConfirmationPage.length) {
            $('.confirmation-container .title.confirmation').append($(".confirmation-survey").show());
            clearInterval(intervalId);
        }
    }, 500);

    // Interval to check and update abandoned cart status
    const abandonCartInterval = setInterval(() => {
        if (sessionStorage.getItem('checkout_items_hubspot')) {
            let customerEmail = sessionStorage.getItem('customerEmail');
            if (window.location.href.includes('qa.trimarketplace.com')) {
                customerEmail = 'kevin.kindorf@trimarkusa.com';
            }
            $.ajax({
                url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                type: 'patch',
                dataType: 'json',
                contentType: 'application/json',
                success: function () {
                    sessionStorage.setItem('triggerAbandonCart', true);
                },
                data: JSON.stringify({
                    "properties": {
                        "rhythm_abandoned_cart": "true",
                        "rhythm_abandoned_cart_total": parseFloat(sessionStorage.getItem('checkout_value')).toFixed(2),
                        "rhythm_cart_items": sessionStorage.getItem('checkout_items_hubspot')
                    }
                })
            });
            clearInterval(abandonCartInterval);
        }
    }, 200);
});
