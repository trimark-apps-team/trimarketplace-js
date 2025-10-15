// ===========================================================
// Observer Configuration
// ===========================================================
window.initProductDetailObserver = () => {
  const targetNode = document.body;
  const config = { childList: true, characterData: false, subtree: true, attributes: true };

  const callback = (mutationsList, observer) => {
      // Add any future observer-triggered functions here
      // window.addQuantityListener();
      // window.replaceProductDescription();
      // window.getShippingInfo();
      // window.moveStockText();
      // window.loadWarehouses();
      // window.getItemWarehouseInfo();
  };

  const observer = new MutationObserver(callback);
  if (targetNode) observer.observe(targetNode, config);
};

// ===========================================================
// Load Warehouses & Item Info
// ===========================================================
window.loadWarehouses = async () => {
  try {
      const data = await window.getWarehouses();
      const warehouseList = data.map(warehouse => warehouse.id);
      $("body").data({ warehouses: warehouseList });
      await window.getItemWarehouseInfo();
      console.log("warehouses loaded");
  } catch (error) {
      console.error("Error loading warehouses:", error);
  }
};

window.getItemWarehouseInfo = async () => {
  const warehouses = $("body").data("warehouses");
  const widgetInstance = window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"].instance;
  const itno = widgetInstance?.productDetailMode;

  if (!itno || !warehouses) return;

  const isNonStockItem = await window.isNonStock(itno, warehouses);
  const productInformation = $('.product-information');
  const shippingInformation = $(productInformation).find('.shipping-information');
  const hasNoStock = $(".title").text().includes('No Stock');

  const lowShippingText = '<p class="low-shipping" style="margin-top:10px;">ETA - Shipping 2-3 weeks</p>';
  const lowText = '<div class="low-stock-warning"><svg class="icon warning" focusable="false"><use xlink:href="#warning"></use></svg><span class="message warning" style="margin-left:10px">Low</span></div>';

  const ribbonLabel = $('.ribbon-container');

  if (isNonStockItem && hasNoStock) {
      if (!$(ribbonLabel).find('p.non-stock-pdp').length) {
          $(ribbonLabel).prepend('<p class="non-stock-pdp" style="display: none">Non-Stock</p>');
      }

      if (!$(shippingInformation).find('.low-shipping').length) {
          $(shippingInformation).append(lowShippingText);
      }

      $(".title").hide();

      if (!$(shippingInformation).find('.low-stock-warning').length) {
          $(shippingInformation).prepend(lowText);
      }
  } else {
      const stockedText = $('.stock-text')?.text();
      if (stockedText) {
          $('.stock-text').text(`${stockedText} quantity`);
          $('.stock-text').append("<div class='stocked-text-oos' style='display:block'>ETA - Shipping 2-3 days</div>");
      }
  }
};

// ===========================================================
// Fetch Warehouses API
// ===========================================================
window.getWarehouses = async () => {
  try {
      const response = await fetch('/delegate/ecom-api/warehouses?size=100', { method: "GET" });
      return await response.json();
  } catch (error) {
      console.error('Error fetching warehouses:', error);
      return [];
  }
};

// ===========================================================
// Check if item is non-stock
// ===========================================================
window.isNonStock = async (itno, warehouseList) => {
  const apiUrl = `/o/generic-api/EXPORTMI_MITBAL?qery=MBCONO,MBITNO,MBWHLO,MBIPLA,MBOPLC from MITBAL where MBCONO=[200] and MBITNO=['${itno}']`;
  try {
      const res = await fetch(apiUrl, { method: "GET" });
      const data = await res.json();
      const hasStock = data.results[0].records.some(rec => {
          const repl = rec.REPL.toString().split(';');
          return repl[4] === '1' && warehouseList.includes(repl[2]);
      });
      return !hasStock;
  } catch (error) {
      console.error('Error fetching MITBAL data:', error);
      return false;
  }
};

// ===========================================================
// Set product description from Item Name
// ===========================================================
window.setProductDescriptionToItemName = async () => {
  const itno = window.location.pathname.split("/").pop();
  const apiUrl = `/delegate/ecom-api/items/${itno}/attributes?size=-1`;
  try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      const obj = data.filter(o => o.key === 'PMDM.AT.ItemName');
      const desc = obj[0]?.values[0] || "";
      $('.product-description').text(desc);
  } catch (error) {
      console.error('Error setting product description:', error);
  }
};

// ===========================================================
// DOMNodeInserted Event: Prop 65, Reeses Law, Non-Stock, Pim Labels
// ===========================================================
window.initProductDetailNodeListener = () => {
  addEventListener("DOMNodeInserted", () => {
      const widgetInstance = window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"].instance;
      if (widgetInstance) {
          const ribbonContainer = $('.ribbon-container')[0];
          if (!$(ribbonContainer).find('div.item-number-top').length) {
              const itemId = widgetInstance.productDetailModel?.attributes?.id;
              $(ribbonContainer).append(`<div class="item-number-top">Item number: <span>${itemId}</span></div>`);
          }
      }

      const modal = document.querySelector(".modal");
      const overlay = document.querySelector(".overlay");
      const openModalBtn = document.querySelector(".btn-open");
      const openReesesModalBtn = document.querySelector(".btn-open-reeses");
      const closeModalBtn = document.querySelector(".btn-close");

      const closeModal = () => {
          modal?.classList.add("hidden");
          overlay?.classList.add("hidden");
      };

      closeModalBtn?.addEventListener("click", closeModal);
      overlay?.addEventListener("click", closeModal);

      document.addEventListener("keydown", e => {
          if (e.key === "Escape" && !modal?.classList.contains("hidden")) closeModal();
      });

      const openModal = e => {
          let modalText = "";
          if (e.target.className.includes("reeses-law")) {
              modalText = "<p>“KEEP new and used batteries OUT OF REACH OF CHILDREN.” (Reese's Law)</p>";
          } else if (e.target.className.includes("prop-65")) {
              modalText = "<p>Warning: Cancer and Reproductive Harm <a href='https://www.p65warnings.ca.gov' target='_new'>www.p65warnings.ca.gov</a></p>";
          }
          $(document.querySelector(".warning-modal-content")).html(modalText);
          modal?.classList.remove("hidden");
          overlay?.classList.remove("hidden");
      };

      openModalBtn?.addEventListener("click", openModal);
      openReesesModalBtn?.addEventListener("click", openModal);

      // Add Prop 65, Reeses, Pim, Non-Stock labels
      const descriptionRegion = $('.description-region')[0]?.children[0];
      const ribbonLabel = $('.ribbon-container');

      const hasProp65 = $('.attribute-name:contains("Prop 65")').next()?.text().includes("Yes");
      const hasReese = $('.attribute-name:contains("Reese")').next()?.text().includes("Yes");
      const hasPim = $('.attribute-name:contains("Private Label")').next()?.text().includes("Yes");
      const isNonStock = $('.attribute-name:contains("Inventory Status")').next()?.text().includes("Stocked") === false;

      if (hasProp65 && !$(descriptionRegion).find('.prop-65').length) {
          $(descriptionRegion).append("<div class='prop-65'>...Prop65 HTML...</div>");
      }

      if (hasPim && !$(ribbonLabel).find('p.pim-label').length) $(ribbonLabel).prepend('<p class="pim-label">TriMark</p>');
      if (isNonStock && !$(ribbonLabel).find('p.non-stock-pdp').length) $(ribbonLabel).prepend('<p class="non-stock-pdp">Non-Stock</p>');
      if (hasReese && !$(descriptionRegion).find('.reeses-law').length) $(descriptionRegion).append("<div class='reeses-law'>...Reese HTML...</div>");
  });
};

// ===========================================================
// Initialize everything
// ===========================================================
$(document).ready(async () => {
  window.initProductDetailObserver();
  window.initProductDetailNodeListener();
  await window.loadWarehouses();
  await window.setProductDescriptionToItemName();
});
