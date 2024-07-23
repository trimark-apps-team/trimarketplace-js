const config = { childList: true, characterData: false, subtree: true, attributes: true };

const callback = function (mutationsList, observer) {
  //addQuantityListener();
  // replaceProductDescription(); 
  //getShippingInfo();     
  //moveStockText(); 
  // getWarehouses();

};

const observer = new MutationObserver(callback);

var targetNode = document.body;

if (targetNode) {
  observer.observe(targetNode, config);
}


///////
$(document).ready(function () {
  setTimeout(loadWarehouses, 1000);
});

// Fetch warehouses data and process non-stock items
const loadWarehouses = () => {
  getWarehouses()
    .then(data => {
      const warehouseList = data.map(warehouse => warehouse.id);
      $("body").data({ warehouses: warehouseList });
    })
    .then(() => getItemWarehouseInfo())
    .then(() => console.log("loaded warehouses"))
}
///////

const getItemWarehouseInfo = () => {
  const warehouses = $("body").data("warehouses");
  let widgetInstance = window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"].instance;
  const itno = widgetInstance.productDetailModel?.attributes?.id;

  console.log(itno);
  console.log(warehouses);
  isNonStock(itno, warehouses)
    .then(result => {
      console.log('result');
      console.log(result); // Log the result (true or false) to the 

      // info about shipping
      const productInformation = $('.product-information');

      const shippingInformation = $(productInformation).find('.shipping-information');

      const hasNoStockMessage = $(".title").text().includes('No Stock');

      const lowShippingText = '<p class="low-shipping" style="margin-top:10px;">ETA - Shipping 2-3 weeks</p>';

      const lowText = '<div class="low-stock-warning"><svg class="icon warning" focusable="false"><use xlink:href="#warning"></use></svg><span class="message warning" style="margin-left:10px">Low</span></div>';

      const notInStockText = '<div class="error-message low-warning"><svg class="icon warning" focusable="false"><use xlink:href="#warning"></use></svg><span class="message warning">Low</span></div>';
      console.log("------");
      console.log(productInformation);
      console.log(shippingInformation);
      console.log(hasNoStockMessage);
      console.log(lowText);
      console.log(notInStockText);



      const hasNoStock = $(".title").text().includes('No Stock');

      if (result == true && hasNoStock) {
        //is non stock 
        console.log("add ribbon");
        const ribbonLabel = $('.ribbon-container');
        if (!$(ribbonLabel).find('p.non-stock-pdp').length) {
          $(ribbonLabel).prepend('<p class="non-stock-pdp" style="display: none">Non-Stock</p> ');
        }

        if (!$(shippingInformation).find('.low-shipping').length) {
          $(shippingInformation).append(lowShippingText);
        }

        $(".title").hide();


        if (!$(shippingInformation).find('.low-stock-warning').length) {
          console.log("add message");
          $(shippingInformation).prepend(lowText);
        }


      } else if (result == false && hasNoStock) {

      } else {
        let stockedText = $('.stock-text')?.text();
        let stockedTextNew = `${stockedText} quantity`
        $('.stock-text').text(stockedTextNew);
        $('.stock-text').append("<div class='stocked-text-oos' style='display:block'>ETA - Shipping 2-3 days</div>");

      }

    })
    .catch(error => {
      console.error('Error:', error); // Log any errors to the console
    });

}


//await new Promise(resolve => setTimeout(() => { fetchShippingInfo() }, 1000))

const fetchShippingInfo = () => {
  getShippingInfo = () => {


    const nonStockRibbon = $('.non-stock-pdp');
    const productInformation = $('.product-information');
    const shippingInformation = $(productInformation).find('.shipping-information');
    const hasNoStock = $(".title").text().includes('No Stock');
    const lowText = '<div class="error-message low-warning"><svg class="icon warning" focusable="false"><use xlink:href="#warning"></use></svg><span class="message warning" style="margin-left:10px">Low</span></div>';
    const notInStockText = '<div class="error-message low-warning"><svg class="icon warning" focusable="false"><use xlink:href="#warning"></use></svg><span style="margin-left:10px" class="message warning">Currently not in stock</span></div>';


    if ($('.low-warning').length == 0 && hasNoStock && nonStockRibbon.length == 0) {
      $(".title").hide();
      $(shippingInformation).prepend(lowText)
    } else if ($('.low-warning').length == 0 && nonStockRibbon.length) {
      $(".title").hide();
      $(".add-to-cart:not('.btn')").prepend(notInStockText);
    }

    let shippingMessage = "ETA";
    if (nonStockRibbon.length) {
      shippingMessage = "<p class='err-text'>ETA - Shipping within 2-3 weeks</p>"
    } else if (hasNoStock) {
      shippingMessage = "<p class='err-text'>ETA - Items will ship once restocked</p>"
    } else {
      shippingMessage = "<p class='err-text'>ETA - Shipping within 2-3 days</p>"
    }

    if ($('.err-text').length == 0) {
      $(shippingInformation).append(shippingMessage);
    }
  }
}

replaceProductDescription = () => {
  const productDescription = $('.product-description')[0];
  const productTitle = $('.product-title > h1')[0];
  const hasTitleClass = $('.product-description').hasClass("title");
  const hasDescClass = $('.product-title').hasClass("desc");
  const hasSameTitle = $(productTitle).text().trim() == $(productDescription).text().trim()

  if (!$(productDescription).attr('orig') && productDescription?.innerText != '') {
    // set attr to orginal text
    $(productDescription).attr('orig', productDescription?.innerText);
    $(productTitle).attr('orig', productTitle?.innerText);
  } else if ($(productDescription).attr('orig') != productTitle?.innerText) {
    // $(productTitle).text($(productDescription).attr('orig'));
    // $(productDescription).text($(productTitle).attr('orig'));
  }

  if ($(productTitle).text().trim() == $(productDescription).text().trim()) {
    $(productDescription).hide();
  }
}

addQuantityListener = () => {
  $('.quantity .input-text').on('input', function () {
    $(this).val($(this).val().replace(/[^a-z0-9]/gi, ''));
  });
}

const isNonStock = async (itno, warehouseList) => {
  const g_EXPORTMI_MITBAL = '/o/generic-api/EXPORTMI_MITBAL?qery=';
  let querystr = `MBCONO,MBITNO,MBWHLO,MBIPLA[ ]from[ ]MITBAL[ ]where[ ]MBCONO[ ]=[ ]200[ ]and[ ]MBITNO[ ]=[ ][']${itno}[']`;

  let apiurl = g_EXPORTMI_MITBAL + querystr;

  try {
    const response = await fetch(apiurl, {
      method: "GET"
    });
    const data = await response.json();

    const hasStockItems = data.results[0].records.some((rec) => {
      const repl = rec.REPL.toString().split(';');
      return repl[3] === '30' && warehouseList.includes(repl[2]);
    });

    return !hasStockItems;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false; // Return false in case of error
  }
}

// Fetch warehouses data from the API
const getWarehouses = () => {
  const apiUrl = '/delegate/ecom-api/warehouses?size=100';
  return fetch(apiUrl, { method: "GET" })
    .then((res) => res.json())
    .then(function (data) {
      return data;
    })
    .catch(function (error) {
      console.log(`(error)->${error}`);
      throw error;
    });
}


moveStockText = () => {
  if ($(".inner-container").find(".stock-text").length > 0) {
    const stockText = $(".stock-text");
    $(".add-to-cart:not('.btn')").prepend(stockText);
    var inventory = $('li.title').detach()
    $('div.add-to-cart').prepend(inventory);
  }
}

window.addEventListener('load', async () => {
  try {

    if ($(".inner-container").find(".stock-text").length > 0) {
      const stockText = $(".stock-text");
      $(".add-to-cart:not('.btn')").prepend(stockText);
    }

    var inventory = $('li.title').detach()
    $('div.add-to-cart').prepend(inventory);

    const warehouses = await getWarehouses();
    const productInformation = $('.product-information');
    $(productInformation).prepend(`<div class='shipping-information'></div>`);

  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
});

addEventListener("DOMNodeInserted", (event) => {
  let widgetInstance = window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"].instance;

  if (widgetInstance) {
    const ribbonContainer = $('.ribbon-container')[0];
    if (!$(ribbonContainer).find('div.item-number-top').length) {
      const itemId = widgetInstance.productDetailModel?.attributes?.id;
      $(ribbonContainer).append(`<div class="item-number-top">Item number: <span>${itemId}</span></div>`);
    }
  }

  const modal = document.querySelector(".modal");
  const warningText = document.querySelector(".warning-modal-content");
  const overlay = document.querySelector(".overlay");
  const openReesesModalBtn = document.querySelector(".btn-open-reeses");
  const openModalBtn = document.querySelector(".btn-open");
  const closeModalBtn = document.querySelector(".btn-close");

  // close modal function
  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  // close the modal when the close button and overlay is clicked
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);
  }

  // close modal when the Esc key is pressed
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // open modal function
  const openModal = function (e) {

    const isReesesLaw = e.target.className.includes("reeses-law");
    const isProp65 = e.target.className.includes("prop-65");

    let modalText = "";

    if (isProp65) {
      modalText = "<p>Warning: Cancer and Reproductive Harm  <a href='https://www.p65warnings.ca.gov' target='_new'> www.p65warnings.ca.gov</a></p>";
    } else if (isReesesLaw) {
      modalText = "<p>“KEEP new and used batteries OUT OF REACH OF CHILDREN.” This sentence implements language in section 2(b)(2) of Reese's Law. In addition, use of the icon recognized for keeping items out of children's reach is intended to quickly convey the required message and direct the reader's attention to the label.</p>"
    }

    $(warningText).html(modalText);

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");

  };
  // open modal event
  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
  }

  // open modal event
  if (openReesesModalBtn) {
    openReesesModalBtn.addEventListener("click", openModal);
  }
  //end modal

  // Handle Prop 65 
  let hasProp65 = false;
  let prop65 = $('.attribute-name:contains("Prop 65")');
  if (prop65[0]?.innerText == "Prop 65") {
    const prop65Next = prop65.next();
    hasProp65 = prop65Next[0].innerText.indexOf("Yes") > -1 ? true : false;
  }

  // Handle Reeses Law
  let hasReese = false;
  let reese = $('.attribute-name:contains("Reese")');
  if (reese[0]?.innerText.indexOf("Reese") > -1) {
    const reeseNext = reese.next();
    hasReese = reeseNext[0].innerText.indexOf("Yes") > -1 ? true : false;
  }

  // Has Pim Law
  let hasPim = false;
  let pim = $('.attribute-name:contains("Private Label")');
  if (pim[0]?.innerText.indexOf("Private Label") > -1) {
    const pimNext = pim.next();
    hasPim = pimNext[0].innerText.indexOf("Yes") > -1 ? true : false;
  }

  // Is Non-Stock
  let isNonStock = false;
  let nonStock = $('.attribute-name:contains("Inventory Status")');
  if (nonStock[0]?.innerText.indexOf("Inventory Status") > -1) {
    const nonStockNext = nonStock.next();
    isNonStock = nonStockNext[0].innerText.indexOf("Stocked") < 1 ? true : false;
  }

  if (hasProp65) {
    const prop65Html = "<div class='prop-65'><div class='warning-icon'><span><svg class='icon warning modal-warning'><use xlink:href='#warning'></use></svg></div><div class='warning-text' ><span class='warning-header'>WARNING</span><p>This product can expose you to chemicals including Vinyl chloride which is known to the State of California to cause cancer, birth defects or other reproductive harm. Visit <a href='https://www.p65warnings.ca.gov' target='_blank'>www.p65warnings.ca.gov</a> for more information.</p><div></div>";

    const descriptionRegion = $('.description-region')[0].children[0];
    if (!$(descriptionRegion).find('.prop-65').length) {
      $(descriptionRegion).append(prop65Html);
    }
  }

  const ribbonLabel = $('.ribbon-container');
  if (hasPim) {
    if (!$(ribbonLabel).find('p.pim-label').length) {
      $(ribbonLabel).prepend('<p class="pim-label">TriMark</p> ');
    }
  }
  if (isNonStock) {
    if (!$(ribbonLabel).find('p.non-stock-pdp').length) {
      $(ribbonLabel).prepend('<p class="non-stock-pdp">Non-Stock</p> ');
    }
  }

  var sourceElement = $('.item-number');

  if (hasReese) {
    const descriptionRegion = $('.description-region')[0].children[0];

    const reesesLawHtml = "<div class='reeses-law'><div class='warning-icon'><span><svg class='icon warning modal-warning'><use xlink:href='#warning'></use></svg></div><div class'warning-text' ><span class='warning-header'>WARNING</span> <a href='https://www.federalregister.gov/documents/2023/09/21/2023-20334/safety-standard-for-button-cell-or-coin-batteries-and-consumer-products-containing-such-batteries' target='_blank'>Button Cell or Coin Batteries (Reese’s Law)</a> <ul><li><b>INGESTION HAZARD: DEATH</b> or serious injury can occur if ingested.</li><li>A swallowed button cell or coin battery can cause <b>Internal Chemical Burns</b> in as little as <b>2 hours.</b></li><li>KEEP new and used batteries <b>OUT OF THE REACH OF CHILDREN</b></li><li><b>Seek immediate medical attention</b> if a battery is suspected to be swallowed or inserted inside any part of the body.</li></ul><div></div>";

    if (!$(descriptionRegion).find('.reeses-law').length) {
      $(descriptionRegion).append(reesesLawHtml);
    }
  }
});