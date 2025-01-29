// prevent special characters
addEventListener("DOMNodeInserted", (event) => {
    addQuantityListener();
});

addQuantityListener = () => {
    $('.quantity > .input-text').on('input', function () {
        $(this).val($(this).val().replace(/[^a-z0-9]/gi, ''));
    });
}

$(window).on('load', function () {
    $(".item-number-input").attr("placeholder", "Item#");
    $(".0-item-number-input").attr("placeholder", "Item#");
    $(".cart-orderlines-region").append('<div class="content-box" style="margin-bottom: 10px; border-radius: 0px;"> <div class="content"><h4 style="text-align: center; padding-bottom: 10px;">Thank you for your business!</h4><p class="minimum" style="text-align: center;">Minimum $350 order before tax (anything under the minimum is subject to a $25 charge),</p><p class="minimum" style="text-align: center;">unless alternate shipping rates have been previously agreed to in your contract.</p><p class="note" style="text-align: center; font-weight: bold;">Please note that shipping charges are not included and will be calculated prior to shipment.</p></div></div>')
});


addEventListener("DOMNodeInserted", (event) => {
    setItemInput();
});

setItemInput = () => {
    $(".item-number-input").attr("placeholder", "Item#");
    $(".0-item-number-input").attr("placeholder", "Item#");
}