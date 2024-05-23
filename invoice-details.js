$(document).ready(function () {
    setTimeout(function () {
        $("ul.prices li").each(function () {
            if ($(this).hasClass('chrg-bulk')) {
                $(this).hide()
            }
            if ($(this).hasClass('chrg-frtext')) {
                $(this).find('.amount-label').text('Freight External')
            }
            if ($(this).hasClass('chrg-trimin')) {
                $(this).find('.amount-label').text('Trimark Minimum Order Charge ($25 fee)')
            }
            if ($(this).hasClass('chrg-triref')) {
                $(this).find('.amount-label').text('Trimark Transaction Fee')
            }
            if ($(this).hasClass('chrg-tritra')) {
                $(this).find('.amount-label').text('Trimark Reference')
            }
            if ($(this).hasClass('chrg-pl')) {
                $(this).find('.amount-label').text('Warehouse (Ext.)')
            }
        })
        let pl = $("ul.prices").find('.chrg-pl')
        pl.remove()
        $('ul.prices').append(pl)
        $(".order-summary-component .content").append("<p style='text-align: center; padding: 10px;'>For total invoice including tax, please download the PDF from the link above.</p>")
    }, 1000)


})