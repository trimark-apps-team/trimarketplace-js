/* ================================
   Global Utility & Config
================================ */
window.g_EXPORTMI_MITBAL = '/o/generic-api/EXPORTMI_MITBAL?qery=';
window.checkedItems = new Set();

/* ================================
   Reset Non-Stock UI
================================ */
window.resetNonStockUI = function () {
  $("body").removeData("nonStockItems");

  $(".private-label").each(function () {
    if ($(this).text().trim() === "Non-Stock") {
      $(this).remove();
    }
  });

  $(".non-stocked-text").remove();
};

/* ================================
   Update Product Description
================================ */
window.updateDescription = async function (itno) {
  const apiUrl = `/delegate/ecom-api/items/${itno}/attributes?size=-1`;
  const card = $('#' + itno);
  const productCardTitle = $(card).find('h7');

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    let itemObj = data.find(obj => obj.key === "PMDM.AT.ItemName");
    let itemNameValue = (itemObj && itemObj.values && itemObj.values[0]) || null;

    if (itemNameValue && (
      itemNameValue.includes('Premier') ||
      itemNameValue.includes('Alani') ||
      itemNameValue.includes('Culinary Essentials') ||
      itemNameValue.includes('Kintera')
    )) {
      const ribbonContainer = $(card).find('.ribbon-container');
      const privateLabelContainer = $(ribbonContainer).find('.private-label');

      if ($(privateLabelContainer).length === 0) {
        $(ribbonContainer).prepend($("<div class='private-label'>TriMark</div>"));
      }
    }

    return data;
  } catch (error) {
    console.error(`updateDescription() error -> ${error}`);
    return false;
  }
};

/* ================================
   Display Non-Stock Banner (Safe)
================================ */
window.displayNonStockBanner = function (itno) {
  const cardContainer = $(`#${itno}`);
  if (!cardContainer.length) return;

  const ribbonContainer = $(cardContainer).find('.ribbon-container');
  const stockContainer = $(cardContainer).find('.stock-or-atp-region');

  if ($(ribbonContainer).find('.non-stock').length) return;

  const thisWarning = $(stockContainer).find('.message.warning');

  $(ribbonContainer).prepend(
    $("<div class='private-label non-stock' style='background-color:#FF8C00'>Non-Stock</div>")
  );

  if (
    $(stockContainer).find('.non-stocked-text').length === 0 &&
    $(stockContainer).find('.stocked-text-oos').length === 0
  ) {
    if ($(thisWarning).text().includes('not in stock')) {
      $(stockContainer).append("<div class='non-stocked-text'>ETA - Shipping 2-3 weeks.</div>");
      $(thisWarning).text("Low");
    } else {
      $(stockContainer).append("<div class='non-stocked-text' style='color:red'>ETA - Shipping 2-3 weeks.</div>");
    }
  }
};

/* ================================
   Check Non-Stock Status
================================ */
window.isNonStock = async function (itno, warehouseList) {
  await window.updateDescription(itno);

  let querystr = `MBCONO,MBITNO,MBWHLO,MBIPLA,MBOPLC[ ]from[ ]MITBAL[ ]where[ ]MBCONO[ ]=[ ]200[ ]and[ ]MBITNO[ ]=[ ][']${itno}[']`;
  let apiurl = window.g_EXPORTMI_MITBAL + querystr;

  try {
    const res = await fetch(apiurl);
    const data = await res.json();

    if (data.nrOfSuccessfullTransactions > 0) {
      const inventory = data.results[0].records.some(rec => {
        const repl = rec.REPL.toString().split(';');
        return (repl[4] === "1" || repl[4] === "") && warehouseList.includes(repl[2]);
      });

      if (!inventory) window.displayNonStockBanner(itno);
      return inventory;
    } else {
      console.warn(`M3 API Error: ${data.results[0].errorMessage}`);
      return false;
    }
  } catch (error) {
    console.error(`isNonStock() error -> ${error}`);
    return false;
  }
};

/* ================================
   Fetch Warehouses
================================ */
window.fetchWarehouses = async function () {
  try {
    const res = await fetch('/delegate/ecom-api/warehouses?size=100');
    const data = await res.json();

    if (data?.length) {
      sessionStorage.setItem("warehouseData", JSON.stringify(data));
    }
  } catch (error) {
    console.error("fetchWarehouses() error ->", error);
  }
};

/* ================================
   Get All Inventory (Deduped)
================================ */
window.getAllInventory = function (items) {
  const warehouseData = JSON.parse(sessionStorage.getItem("warehouseData")) || [];
  const warehouseIds = warehouseData.map(wh => wh.id);

  window.checkedItems.clear();

  items.forEach(itno => {
    if (!window.checkedItems.has(itno)) {
      window.checkedItems.add(itno);
      window.isNonStock(itno, warehouseIds);
    }
  });
};

/* ================================
   Watch Product Cards (Pagination Safe)
================================ */
window.watchProductCards = function () {
  const productGridSelector = '.products.grid';
  const productCardSelector = '.product-card';
  let productIds = [];
  let debounceTimer = null;

  const getProductIds = () =>
    Array.from(document.querySelectorAll(productCardSelector))
      .map(card => card.id)
      .filter(Boolean);

  const checkForChanges = () => {
    const newProductIds = getProductIds();

    const changed =
      newProductIds.length !== productIds.length ||
      !newProductIds.every((id, i) => id === productIds[i]);

    if (changed) {
      window.resetNonStockUI();
      window.getAllInventory(newProductIds);
      productIds = newProductIds;
    }
  };

  const observer = new MutationObserver(() => {
    if (!document.querySelector(productGridSelector)) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkForChanges, 150);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.querySelector(productGridSelector)) {
    productIds = getProductIds();
    window.getAllInventory(productIds);
  }
};

/* ================================
   Color Swatch Transformation
================================ */
window.applySwatchTransformation = function () {
  const colorFamilyList = document.querySelector("#pmdm\\.at\\.colorfamily");
  if (!colorFamilyList) return;

  colorFamilyList.querySelectorAll(".input-checkbox + label").forEach(label => {
    let checkbox = label.previousElementSibling;
    if (checkbox && !label.querySelector(".color-swatch")) {
      let color = checkbox.value.toLowerCase();
      let colorMap = {
        amber: "#FFBF00",
        black: "black",
        copper: "#b87333",
        gray: "gray",
        green: "green",
        natural: "#d2b48c",
        red: "red",
        silver: "silver",
        brown: "brown",
        clear: "white",
        white: "white",
        yellow: "yellow",
        beige: "beige",
        blue: "blue",
        orange: "orange",
        burgundy: "#800020",
        pink: "pink",
        purple: "purple",
        taupe: "#FFFDD0",
        cream: "#FFFDD0",
        ivory: "ivory",
        walnut: "brown",
        assorted: "linear-gradient(90deg, Red, Orange, Yellow, Green, Blue, Indigo, Violet)"
      };

      if (colorMap[color]) {
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "8px";
        label.style.cursor = "pointer";

        let swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.style.width = "25px";
        swatch.style.height = "25px";
        swatch.style.borderRadius = "5px";
        swatch.style.border = "1px solid #ccc";
        swatch.style.background = colorMap[color];

        let quantityMatch = label.textContent.match(/\(\d+\)/);
        let quantityText = quantityMatch ? quantityMatch[0] : "";

        label.textContent = quantityText;
        label.insertBefore(swatch, label.firstChild);
        label.title = checkbox.value;

        const updateSwatchBorder = () => {
          swatch.style.border = checkbox.checked ? "3px solid #000" : "1px solid #ccc";
        };

        updateSwatchBorder();
        checkbox.addEventListener("change", updateSwatchBorder);
      }
    }
  });
};

/* ================================
   Observe DOM Changes
================================ */
window.observeDOMChanges = function () {
  window.applySwatchTransformation();

  const observer = new MutationObserver(() => {
    window.applySwatchTransformation();
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

/* ================================
   Initialize
================================ */
$(document).ready(function () {
  setTimeout(window.fetchWarehouses, 1500);
  setTimeout(window.watchProductCards, 1000);
  setTimeout(window.observeDOMChanges, 2000);
});
