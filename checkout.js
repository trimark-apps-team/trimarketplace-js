const getCartId = () => {
    // Get the string containing the URL
    var urlString = window.location.hash;

    // Split the string to get the query part
    var queryPart = urlString.split('?')[1];

    // Check if the query part exists
    if (queryPart) {
        // Split the query part to get individual parameters
        var queryParams = queryPart.split('&');

        // Loop through each parameter to find the 'id' parameter
        for (var i = 0; i < queryParams.length; i++) {
            var keyValue = queryParams[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1];

            // Check if the parameter key is 'id'
            if (key === 'id') {
                // Return the value when 'id' parameter is found
                return value;
            }
        }
    }
    // Return an empty string if 'id' parameter is not found
    return "";
}
 
const setErrorMessage = () => {
    const errorMessageEl = $(".erp-failure-modal")[0];
    const modalSection = $(".bbm-modal-section")[0];
    try {
        if ($(errorMessageEl)) {
            const errorMessageTopBar = $(errorMessageEl).find("h2");
            const refreshMessage = $(modalSection).find("h3");
            $(errorMessageTopBar).text("Unable to process this order. Please contact your Sales Representative for more information.");
            $(refreshMessage).text("");
            const refreshButton = $(".refresh-button");
            console.log(refreshButton);
            if (refreshButton) {
                refreshButton.hide();

                $(".btn-wrapper").css({ display: "block", textAlign: "right" });
                $(".btn-close-modal").css({ width: "auto" });

            }
        }
    } catch (error) {
        console.error(error);
    }
}
 
const setRoleView = () => {
    $.get("/delegate/ecom-api/users/current/", function (data) {
        const userRoles = data.roles;
        const admin = userRoles.find((user) => user.name.includes("Approver"));

        if (admin) {
            $(".address-controls").addClass("approver");
            $(".shipping-addresses-selection").addClass("approver");
        }
        else {
            // not admin, hide checkbox

            $("#default-address").hide();
        }
    });
}

$(document).ready(function () {
    var hasEquipmentTrue = false;
    var hasEquipmentFalse = false;
    const equipShippingDiv = $('<div id="shipping-error" style="color:#A12641; padding-bottom:10px; font-weight:600;">Your order contains equipment and non-equipment items. Please go back to update cart .</div>');
    sessionStorage.removeItem('transactionalEmailSent')
    sessionStorage.removeItem('triggerAbandonCart')

    // --------- MutationObserver ------------//
    const config = { childList: false, characterData: false, subtree: true, attributes: true };
    const callback = function (mutationsList, observer) {
        $.get("/delegate/ecom-api/users/current", function (data) {
            const isGroupUser = data.isMultiCompanyUser;
            if (isGroupUser) {
                $('.shipping-addresses-selection').addClass('groupUser')
            }
        });


        setRoleView();
        setErrorMessage();
 
        if (hasEquipmentTrue && hasEquipmentFalse) {
            var isDisabled = $(".btn.continue").prop('disabled');
            if (!isDisabled) {
                // comment out for now
                // $(".btn.continue").prop("disabled", true);
            }

            if ($("#shipping-error").length === 0) {
                // comment out for now
                //$("footer.btn-wrapper").prepend(equipShippingDiv);
            }


        }

        if ((hasEquipmentTrue === true) || (hasEquipmentTrue === true && hasEquipmentFalse === true)) {
            console.log(hasEquipmentFalse, hasEquipmentTrue)
            // console.log('equipment no error')
            // HAS EQUIPMENT BUT NO ERROR
            var input = $('#yourReference');
            hasEquipmentTrue = true;
            if (input && input.val() == "") {
                input.val("equipment |");
                input.change()

            }
        }
    };

    const observer = new MutationObserver(callback);
    var targetNode = document.body;

    if (targetNode) {
        observer.observe(targetNode, config);
    }

    // --------- end MutationObserver ------------//

    var queryString = window.location.search;

    // Create a jQuery object to parse the query string
    var urlParams = new URLSearchParams(queryString);

    // Get the value associated with the 'id' parameter
    var idValue = urlParams.get('id');

    // Get the value associated with the 'id' parameter
    var idValue = getCartId();

    // Check if 'id' parameter exists and has a value
    if (idValue && idValue !== null) {
        $.ajax({
            url: `/delegate/ecom-api/orders/approval/${idValue}/payment`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "x-requested-with": "XMLHttpRequest"
            },
            type: "PUT",
            dataType: "json",
            data: JSON.stringify({ "paymentMethodId": "1" }),
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {

                // Handle success
                // console.log(response);
                response.orderLines.map((line, index) => {
                    const itemNumber = line.item.itemNumber;
                    const itemObject = `/delegate/ecom-api/items/${itemNumber}/attributes?size=-1`;
                    // console.log('line item');
                    // get attributes
                    $.get(itemObject, function (data) {

                        let hasEquipment = false; // Reset for each item
                        data.map((att) => {
                            if (att.key === "PMDM.AT.EquipmentFlag" && att.values?.length) {
                                hasEquipment = true;
                                // console.log("HAS equip")
                            }
                        });

                        if (hasEquipment) {
                            // console.log('has flag');
                            var input = $('#yourReference');
                            hasEquipmentTrue = true

                        } else {
                            // console.log('No flag');
                            hasEquipmentFalse = true;
                        }
                    });
                });
            },
            error: function (xhr, status, error) {
                // Handle error
            }
        });
    } else {
        // this is not an order, just checkout
        $.get("/delegate/ecom-api/orders/current/", function (data) {
            var totalItems = data.orderLines.length;
            //console.log(data)
            // console.log( $(".items") );
            data.orderLines.map((line, index) => {
                // line items
                const itemNumber = line.item.itemNumber;
                const itemObject = `/delegate/ecom-api/items/${itemNumber}/attributes?size=-1`;
                // console.log('line item')
                // get attributes
                $.get(itemObject, function (data) {
                    let hasEquipment = false; // Reset for each item
                    data.map((att) => {
                        if (att.key === "PMDM.AT.EquipmentFlag" && att.values?.length) {
                            hasEquipment = true;
                        }
                    });

                    if (hasEquipment) {
                        // console.log('has flag');
                        var input = $('#yourReference');
                        hasEquipmentTrue = true
                    } else {
                        // console.log('No flag');
                        hasEquipmentFalse = true;
                    }
                });
            });
        });
    }


});


const fooObserver = new MutationObserver((_mutationList, observer) => {
    const checkoutConfirmation = $('.checkout-container .confirmation-container')
    const reviewContainer = $(".checkout-container .review-container")
 
    if (checkoutConfirmation && window.location.href.includes('checkoutpage/confirmation')) {
        $(".thank-you-container").hide()

        let items = sessionStorage.getItem('checkout_items_hubspot')
        let grandTotal = parseFloat($(".order-summary-component .total .amount").text().replace(/[^.0-9]/g, '')) || 0.00
        let salesEmail = sessionStorage.getItem('salesEmail')
        let customerEmail = sessionStorage.getItem('customerEmail')
        let customerNumber = sessionStorage.getItem('customerNumber')
        let companyName = sessionStorage.getItem('companyName')
        if(window.location.href.includes("qa.trimarketplace.com")) {
            salesEmail = "kevin.kindorf@trimarkusa.com"
            customerEmail = "kevin.kindorf@trimarkusa.com"
        }
      
        if(!sessionStorage.getItem('transactionalEmailSent')) {
            sessionStorage.setItem('transactionalEmailSent', true)
            $.ajax({
                url: 'https://eba-rhythm.trimarketplace.com/post-to-hubspot',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    console.log('success');
                },
                data: JSON.stringify({
                    "emailId": "170878458282",
                    "message": {
                        "to": salesEmail,
                        "from": "support@trimarkusa.com",
                        "cc": ["demo_support@trimarkusa.com"]
                    },
                    "customProperties": {
                        "customerEmail": customerEmail,
                        "customerNumber": customerNumber,
                        "companyName": companyName, 
                        "cart_total": grandTotal.toFixed(2),
                        "cart": items
                    }
                })
            });
        }

        if(sessionStorage.getItem('triggerAbandonCart')) {
            sessionStorage.setItem('triggerAbandonCart', false)
            console.log('updating abandon cart trigger to false')
            $.ajax({
                url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                type: 'patch',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    console.log('abandon cart set to false')
                    
                },
                data: JSON.stringify({
                    "properties": {
                        "rhythm_abandoned_cart": "false"
                    }
                })
            });
        }

        // only set notify flag to false after completing checkout if pendingApprovalCount is equal to last or none. Last means
        // the approver has successfully approved the last pending order in their last for the end user. None means when the
        // approver visited the approvals page and no orders were pending then they have no orders in their list pending so set 
        // notify flag to false 
        if(sessionStorage.getItem('pendingApprovalCount') === 'none' || sessionStorage.getItem('pendingApprovalCount') === 'last') {
            console.log('pending approval total is ' + sessionStorage.getItem('pendingApprovalCount'))
            sessionStorage.setItem('triggerPendingApproval', 'false')
            console.log('updating approver notify to false')
            $.ajax({
                url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                type: 'patch',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    console.log('trigger approver notify set to false')
                    
                },
                data: JSON.stringify({
                    "properties": {
                        "rhythm_approver_notify": "false"
                    }
                })
            });
        }
        
    }
    if (reviewContainer && window.location.href.includes('checkoutpage/review')) {
        $(".thank-you-container").show()
    }


});

fooObserver.observe(document.body, { childList: true, subtree: true });

var intervalId = window.setInterval(function () {
    const checkoutConfirmationPage = $('.checkout-container .confirmation-container')
    if (checkoutConfirmationPage.length) {
        let appendCount = 0;
        if (appendCount === 0) {
            $('.confirmation-container .title.confirmation').append($(".confirmation-survey").show())
            appendCount++;
            clearInterval(intervalId)
        }
    }
}, 500);


var abandonCartInterval = window.setInterval(function() {
    
    if(sessionStorage.getItem('checkout_items_hubspot')) {
        console.log('items set')
        let customerEmail = sessionStorage.getItem('customerEmail');
        if(window.location.href.includes('qa.trimarketplace.com')) {
            customerEmail = 'kevin.kindorf@trimarkusa.com'
        }
        let sendCount = 0;
        if(sendCount === 0) {
            sendCount++;
            $.ajax({
                url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                type: 'patch',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    sessionStorage.setItem('triggerAbandonCart', true)
                    
                },
                data: JSON.stringify({
                    "properties": {
                        "rhythm_abandoned_cart": "true",
                        "rhythm_abandoned_cart_total": parseFloat(sessionStorage.getItem('checkout_value')).toFixed(2),
                        "rhythm_cart_items": sessionStorage.getItem('checkout_items_hubspot')
                    }
                })
            });
            clearInterval(abandonCartInterval)
        }
     
    }

}, 200)