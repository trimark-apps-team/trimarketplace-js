// ===========================================================
// TriMark Marketplace - Price List Adjustments
// ===========================================================

window.adjustPriceList = function() {
    $("ul.prices li").each(function () {
        const $li = $(this);

        if ($li.hasClass('chrg-bulk')) {
            $li.hide();
        }
        if ($li.hasClass('chrg-frtext')) {
            $li.find('.amount-label').text('Freight External');
        }
        if ($li.hasClass('chrg-trimin')) {
            $li.find('.amount-label').text('Trimark Minimum Order Charge ($25 fee)');
        }
        if ($li.hasClass('chrg-triref')) {
            $li.find('.amount-label').text('Trimark Transaction Fee');
        }
        if ($li.hasClass('chrg-tritra')) {
            $li.find('.amount-label').text('Trimark Reference');
        }
        if ($li.hasClass('chrg-pl')) {
            $li.find('.amount-label').text('Warehouse (Ext.)');
        }
    });

    // Move .chrg-pl to the end
    const $pl = $("ul.prices").find('.chrg-pl');
    $pl.remove();
    $('ul.prices').append($pl);

    // Append invoice note
    $(".order-summary-component .content").append(
        "<p style='text-align: center; padding: 10px;'>For total invoice including tax, please download the PDF from the link above.</p>"
    );
};

// Run after document ready with delay
$(document).ready(function () {
    setTimeout(function () {
        window.adjustPriceList();
    }, 1000);
});
