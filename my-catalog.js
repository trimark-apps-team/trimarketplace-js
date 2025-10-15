// ===========================================================
// TriMark Marketplace - Inventory & Product Scripts
// ===========================================================

// ----------------------
// Fetch warehouses data from API
// ----------------------
window.getWarehouses = () => {
    const apiUrl = '/delegate/ecom-api/warehouses?size=100';
    return fetch(apiUrl, { method: "GET" })
        .then((res) => res.json())
        .then(data => data)
        .catch(error => { throw error; });
};

// ----------------------
// Check if item is non-stock
// ----------------------
window.isNonStock = async (itno, warehouseList) => {
    const g_EXPORTMI_MITBAL = '/o/generic-api/EXPORTMI_MITBAL?qery=';
    const querystr = `MBCONO,MBITNO,MBWHLO,MBIPLA,MBOPLC[ ]from[ ]MITBAL[ ]where[ ]MBCONO[ ]=[ ]200[ ]and[ ]MBITNO[ ]=[ ][']${itno}[']`;
    const apiurl = g_EXPORTMI_MITBAL + querystr;

    return fetch(apiurl, { method: "GET" })
        .then(res => res.json())
        .then(data => {
            if (data.nrOfSuccessfullTransactions > 0) {
                const inventory = data.results[0].records.some(rec => {
                    const repl = rec.REPL.toString().split(';');
                    return repl[4] === '1' && warehouseList.includes(repl[2]);
                });

                if (!inventory) {
                    const nonStockItems = $("body").data("nonStockItems") || [];
                    nonStockItems.push(itno);
                    $("body").data({ nonStockItems });

                    const productDiv = `#${itno}`;
                    const cardContainer = $(productDiv);
                    const ribbonContainer = $(cardContainer).find('.ribbon-container');
                    const stockContainer = $(cardContainer).find('.stock-or-atp-region');
                    const privateLabelContainer = $(ribbonContainer).find('.non-stock');
                    let thisWarning = $(stockContainer).find('.message.warning');

                    if (privateLabelContainer.length === 0) {
                        ribbonContainer.prepend($("<div class='non-stock' style='display: none'>Non-Stock</div>"));

                        if (stockContainer.find('.non-stocked-text').length === 0 && stockContainer.find('.stocked-text-oos').length === 0) {
                            if (thisWarning.text().includes('not in stock')) {
                                stockContainer.append("<div class='non-stocked-text'>ETA - Shipping 2-3 weeks.</div>");
                                thisWarning.text("Low");
                            } else {
                                stockContainer.append("<div class='stocked-text-oos'>ETA - Items will ship once restocked.</div>");
                            }
                        }
                    }
                }
                return inventory;
            } else {
                console.error('EXPORTMI_MITBAL API error:', data.results[0]);
                return false;
            }
        })
        .catch(error => false);
};

// ----------------------
// Fetch all inventory
// ----------------------
window.getAllInventory = () => {
    const allItemsUrl = '/delegate/ecom-api/items?start=1&size=50&sort=itemName&includeNonStockedFilter=true';
    fetch(allItemsUrl)
        .then(response => response.json())
        .then(data => data.itemResponseList.map(item => item.itemNumber))
        .then(itemNumbers => {
            const warehouses = $("body").data("warehouses");
            return Promise.all(itemNumbers.map(itno => window.isNonStock(itno, warehouses)));
        })
        .catch(error => console.error('Error fetching inventory data:', error));
};

// ----------------------
// Add listener for quantity inputs (alphanumeric only)
// ----------------------
window.addQuantityListener = () => {
    $('.quantity > .input-text').on('input', function () {
        $(this).val($(this).val().replace(/[^a-z0-9]/gi, ''));
    });
};

// ----------------------
// Update product description
// ----------------------
window.updateProductDescription = () => {
    const fetchAndUpdateDescription = (productCardTitle, apiUrl) => {
        return fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                const itemNameValue = data.find(obj => obj.key === "PMDM.AT.ItemName")?.values[0] || null;
                productCardTitle.after('<div class="product-description" style="margin-top: 10px">' + itemNameValue + '</div>');
            });
    };

    const fetchPromises = [];
    $('.product-card').each((index, productCard) => {
        const productId = $(productCard).attr('id');
        const apiUrl = `/delegate/ecom-api/items/${productId}/attributes?size=-1`;
        const productCardTitle = $(productCard).find('h7');

        if (!productCardTitle.next(".product-description").length) {
            fetchPromises.push(fetchAndUpdateDescription(productCardTitle, apiUrl));
        }
    });

    Promise.all(fetchPromises)
        .then(() => console.log("All product descriptions updated successfully."))
        .catch(error => console.error("Error updating product descriptions:", error));
};

// ----------------------
// Set status color (placeholder logic)
// ----------------------
window.setStatusColor = () => {
    $('.status-value').each((i, item) => {
        if (item.innerText === "Approved") item.style.color = "#198E56";
        else if (item.innerText === "Pending") item.style.color = "#C9AA10";
        else if (item.innerText === "Rejected") item.style.color = "#C03326";
    });
};

// ----------------------
// Replace "Not used" labels
// ----------------------
window.replaceLabels = () => {
    $("label:contains('Not used')").text("Non-Stock");
};

// ----------------------
// Add private label ribbons
// ----------------------
window.addPrivateLabel = () => {
    $('.product-description').each((i, el) => {
        const text = $(el).text();
        if (/Premier|Alani|Culinary Essentials|Kintera/.test(text)) {
            const cardContainer = $(el).closest('.card');
            const ribbonContainer = $(cardContainer).find('.ribbon-container');
            if (ribbonContainer.find('.private-label').length === 0) {
                ribbonContainer.prepend("<div class='private-label'>TriMark</div>");
            }
        }
    });
};

// ----------------------
// Replace "not in stock" messages
// ----------------------
window.replaceNotInStock = () => {
    $('.stock-or-atp-region').each((i, stockRegion) => {
        const card = $(stockRegion).closest('.card');
        const nonStockRibbon = card.find('.non-stock');
        let thisWarning = $(stockRegion).find('.message.warning');
        let stockedText = $(stockRegion).find('.stock-level-text')?.text();

        if (thisWarning.length && $(stockRegion).find('.non-stocked-text').length === 0 && $(stockRegion).find('.stocked-text-oos').length === 0) {
            if (thisWarning.text().includes('not in stock')) {
                thisWarning.text("Low");
                $(stockRegion).append("<div class='stock-text-oos'>ETA - Shipping 2-3 weeks</div>");
            }
        } else if ($(stockRegion).find('.stocked-text-oos').length === 0 && stockedText?.length) {
            $(stockRegion).find('.stock-level-text').text(`Quantity: ${stockedText}`);
            $(stockRegion).append("<div class='stocked-text-oos'>ETA - Shipping 2-3 days</div>");
        }
    });
};

// ----------------------
// MutationObserver for product updates
// ----------------------
window.productObserver = new MutationObserver(() => {
    window.setStatusColor();
    window.replaceLabels();
    window.addPrivateLabel();
    window.replaceNotInStock();
});

// ----------------------
// Initialize on DOM ready
// ----------------------
$(document).ready(() => {
    window.getWarehouses()
        .then(data => {
            $("body").data({ warehouses: data.map(w => w.id) });
        })
        .then(() => window.getAllInventory());

    window.productObserver.observe(document.body, { childList: true, subtree: true });
    setInterval(window.updateProductDescription, 3000);
});
