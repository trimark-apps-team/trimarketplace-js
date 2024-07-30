// Fetch warehouses data from the API
const getWarehouses = () => {
    const apiUrl = '/delegate/ecom-api/warehouses?size=100';
    return fetch(apiUrl, { method: "GET" })
        .then((res) => res.json())
        .then(function (data) {
            return data;
        })
        .catch(function (error) {

            throw error;
        });
}

// Check if an item is non-stock based on its item number and warehouse list
async function isNonStock(itno, warehouseList) {
    const g_EXPORTMI_MITBAL = '/o/generic-api/EXPORTMI_MITBAL?qery=';
    let querystr = `MBCONO,MBITNO,MBWHLO,MBIPLA,MBOPLC[ ]from[ ]MITBAL[ ]where[ ]MBCONO[ ]=[ ]200[ ]and[ ]MBITNO[ ]=[ ][']${itno}[']`;
    let apiurl = g_EXPORTMI_MITBAL + querystr;

    return fetch(apiurl, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
            if (data.nrOfSuccessfullTransactions > 0) {
                const inventory = data.results[0].records.some((rec) => {
                    const repl = rec.REPL.toString().split(';');
                    return repl[4] === '1' && warehouseList.includes(repl[2]);
                });

                if (!inventory) {
                    const nonStockItems = $("body").data("nonStockItems") || [];
                    nonStockItems.push(itno);
                    $("body").data({ nonStockItems: nonStockItems });
                    const productDiv = `#${itno}`;
                    const cardContainer = $(productDiv);
                    const ribbonContainer = $(cardContainer).find('.ribbon-container');
                    const stockContainer = $(cardContainer).find('.stock-or-atp-region');
                    const privateLabelContainer = $(ribbonContainer).find('.non-stock');
                    let thisWarning = $(stockContainer).find('.message.warning');
                    thisWarning = $(thisWarning);

                    if ($(privateLabelContainer).length === 0) {
                        $(ribbonContainer).prepend($("<div class='non-stock' style='display: none'>Non-Stock</div>"));


                        if ($(stockContainer).find('.non-stocked-text').length == 0 && $(stockContainer).find('.stocked-text-oos').length == 0) {
                            if ($(thisWarning).text().includes('not in stock')) {
                                $(stockContainer).append("<div class='non-stocked-text'>ETA - Shipping 2-3 weeks.</div>");
                                $(thisWarning).text("Low");
                            } else if ($(stockRegion).find('.stocked-text-oos').length == 0) {

                                $(stockContainer).append("<div class='stocked-text-oos'>ETA - Items will ship once restocked.</div>");
                            }
                        }
                    }
                }
                return inventory;
            } else {
                let errstr = "M3 API-> EXPORTMI_MITBAL\n";
                errstr += "Transaction-> " + data.results[0].transaction + "\n";
                errstr += "Error Type-> " + data.results[0].errorType + "\n";
                errstr += "Error Code-> " + data.results[0].errorCode + "\n";
                errstr += "Error Message-> " + data.results[0].errorMessage + "\n";
                errstr += "Error Field-> " + data.results[0].errorField;

                return false;
            }
        })
        .catch((error) => {
            //console.log(`(error)->${error}`);
            return false;
        });
}

// Fetch warehouses data and process non-stock items
getWarehouses()
    .then(data => {
        const warehouseList = data.map(warehouse => warehouse.id);
        $("body").data({ warehouses: warehouseList });
    })
    .then(() => getAllInventory());

// Observer configuration and callback
const config = { childList: true, characterData: false, subtree: true, attributes: false };
const callback = function (mutationsList, observer) {
    //updateProductDescription();
    setStatusColor();
    replaceLabels();
    addPrivateLabel();
    replaceNotInStock();
    // addQuantityListener();
};

$(document).ready(function () {
    setInterval(updateProductDescription, 3000); // Call updateProductDescription after 1 second
});

const observer = new MutationObserver(callback);
var targetNode = document.body;

if (targetNode) {
    observer.observe(targetNode, config);
}

// Fetch all inventory items
const getAllInventory = () => {
    const allItemsUrl = '/delegate/ecom-api/items?start=1&size=50&sort=itemName&sortType=&search=&manufacturer=&brand=&categoryPath=&promotion=&refinedSearch=&includePrices=false&includeStockLevel=false&productIconCount=10&advancedSearchGroup=&advancedSearch1=&advancedSearch2=&keyAttributeSize=10&hasChanges=true&includeNonStockedFilter=true&_=1707862194556';
    fetch(allItemsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const getItemNumbers = (data) => data.itemResponseList.map(item => item.itemNumber);
            const itemNumbers = getItemNumbers(data);
            return itemNumbers;
        })
        .then(itemNumbers => {
            const warehouses = $("body").data("warehouses");
            const nonStockPromises = itemNumbers.map(itemNumber => {
                isNonStock(itemNumber, warehouses);
            });
            return Promise.all(nonStockPromises);
        })
        .catch(error => {
            console.error('Error fetching inventory data:', error);
        });
}

// Add listener to input fields to allow only alphanumeric characters
const addQuantityListener = () => {
    $('.quantity > .input-text').on('input', function () {
        $(this).val($(this).val().replace(/[^a-z0-9]/gi, ''));
    });
}

// Update product description based on bottom card
// update description under product title
const updateProductDescription = () => {
    // Define a function to fetch data and update product description
    const fetchAndUpdateDescription = (productCardTitle, apiUrl) => {
        return fetch(apiUrl, { method: "GET" })
            .then((res) => res.json())
            .then(function (data) {
                var itemNameValue = data.find(obj => obj.key === "PMDM.AT.ItemName")?.values[0] || null;
                productCardTitle.after('<div class="product-description" style="margin-top: 10px">' + itemNameValue + '</div>');
            })
            .catch(function (error) {
                throw error;
            });
    };

    // Create an array to store promises for each fetch operation
    const fetchPromises = [];

    // Iterate over each product card
    $('.product-card').each((index, productCard) => {
        const productId = $(productCard).attr('id');
        const apiUrl = `/delegate/ecom-api/items/${productId}/attributes?size=-1`;

        const productCardTitle = $(productCard).find('h7');

        // Check if product description already exists
        if (!productCardTitle.next(".product-description").length) {
            // Add fetch operation to the array of promises
            fetchPromises.push(fetchAndUpdateDescription(productCardTitle, apiUrl));
        }
    });

    // Execute promises sequentially
    Promise.all(fetchPromises)
        .then(() => {
            console.log("All product descriptions updated successfully.");
        })
        .catch((error) => {
            console.error("An error occurred while updating product descriptions:", error);
        });
}

// Check inventory status for each product
const checkInventory = () => {
    const warehouses = $("body").data("warehouses");
    $('.with-line-attributes').each((product) => {
        const thisItemNumber = $('.information.with-line-attributes')[product]?.children[2].children[1].children[1].innerText;
        const hasData = $('.products.grid').attr('data-inventory');

        if (hasData != 1 && warehouses) {
            $('.products.grid').attr('data-inventory', 1);
        } else {
            callInventoryApi(thisItemNumber, warehouses);
        }

        callInventoryApi(thisItemNumber, warehouses);
    });
}

// Replace "Not used" label with "Non-Stock"
const replaceLabels = () => {
    var label = $("label:contains('Not used')");
    label.text("Non-Stock");
}

// Set status color based on URL path
const setStatusColor = () => {
    const urlPath = window.location.pathname.split("/");
    const pageName = $("ul.lvl-1-menu.submenu-items");

    if (pageName && pageName.length) {
        $(pageName[0].childNodes).each(function (index, item) {
            if (item.childNodes.length > 1) {
                var url = item.childNodes[1].href.split("/");
            }
        });
    }
}

addPrivateLabel = () => {
    $('.product-description').each((product) => {
        const thisProduct = $('.product-description')[product];
        if ($(thisProduct).text().includes('Premier') || $(thisProduct).text().includes('Alani') ||
            $(thisProduct).text().includes('Culinary Essentials') ||
            $(thisProduct).text().includes('Kintera')) {
            const cardContainer = $(thisProduct).closest('.card');
            const ribbonContainer = $(cardContainer).find('.ribbon-container');
            const privateLabelContainer = $(ribbonContainer).find('.private-label');

            if ($(privateLabelContainer).length === 0) {
                $(ribbonContainer).prepend($("<div class='private-label'>TriMark</div>"));
            }
        }
    });
}

replaceNotInStock = () => {
    $('.stock-or-atp-region').each((stock) => {
        const stockRegion = $('.stock-or-atp-region')[stock];
        const card = $(stockRegion).closest('.card');
        const nonStockRibbon = $(card).find('.non-stock');
        let thisWarning = $(stockRegion).find('.message.warning');
        let stockedText = $(stockRegion).find('.stock-level-text')?.text();

        thisWarning = $(thisWarning);

        if (thisWarning.length && $(stockRegion).find('.non-stocked-text').length == 0 && $(stockRegion).find('.stocked-text-oos').length == 0) {
            if ($(thisWarning).text().includes('not in stock')) {
                $(thisWarning).text("Low");
                $(stockRegion).append("<div class='stock-text-oos'>ETA - Shipping 2-3 weeks</div>");
            }
        } else if ($(stockRegion).find('.stocked-text-oos').length == 0) {

            let stockedTextNew = `Quantity: ${stockedText}`



            if (stockedText.length) {
                $(stockRegion).find('.stock-level-text')?.text(stockedTextNew);
                $(stockRegion).append("<div class='stocked-text-oos'>ETA - Shipping 2-3 days</div>");

            }
        }
    });
}