/* ================================
   Global Utility & Config
================================ */
window.g_CMS100MI_LstItmWhsRTHM = '/o/generic-api/CMS100MI_LstItmWhsRTHM?MBITNO=';

window.fetchJson = async function (url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

window.getStoredWarehouseData = function () {
  try {
    return JSON.parse(sessionStorage.getItem("warehouseData")) || [];
  } catch (error) {
    console.error("getStoredWarehouseData() error ->", error);
    return [];
  }
};

window.getStoredWarehouseIds = function () {
  return window
    .getStoredWarehouseData()
    .map(wh => wh.id?.toString().trim())
    .filter(Boolean);
};

/* ================================
   Fetch Warehouses
================================ */
window.fetchWarehouses = async function () {
  try {
    const data = await window.fetchJson('/delegate/ecom-api/warehouses?size=100');
    const warehouseIds = data
      .map(wh => wh.id?.toString().trim())
      .filter(Boolean);

    $("body").data({ warehouses: warehouseIds });
    sessionStorage.setItem("warehouseData", JSON.stringify(data));

    return warehouseIds;
  } catch (error) {
    console.error("fetchWarehouses() error ->", error);
    $("body").data({ warehouses: [] });
    return [];
  }
};

/* ================================
   Update Product Description & TriMark Label
================================ */
window.updateDescription = async function (itno) {
  const apiUrl = `/delegate/ecom-api/items/${encodeURIComponent(itno)}/attributes?size=-1`;
  const card = $('#' + itno);

  try {
    const data = await window.fetchJson(apiUrl);

    const itemObj = data.find(obj => obj.key === "PMDM.AT.ItemName");
    const itemNameValue = itemObj?.values?.[0] || "";

    const isTriMarkPrivateLabel = ['Premier', 'Alani', 'Culinary Essentials', 'Kintera']
      .some(value => itemNameValue.includes(value));

    if (isTriMarkPrivateLabel) {
      const ribbonContainer = card.find('.ribbon-container');

      if (!ribbonContainer.find('.private-label-trimark').length) {
        ribbonContainer.prepend(
          "<div class='private-label private-label-trimark'>TriMark</div>"
        );
      }
    }

    return data;
  } catch (error) {
    console.error(`updateDescription() error -> ${error}`);
    return false;
  }
};

/* ================================
   Display Non-Stock Banner
================================ */
window.displayNonStockBanner = function (itno) {
  const nonStockItems = $("body").data("nonStockItems") || [];

  if (!nonStockItems.includes(itno)) {
    nonStockItems.push(itno);
  }

  $("body").data({ nonStockItems });

  const card = $('#' + itno);
  const ribbonContainer = card.find('.ribbon-container');
  const stockContainer = card.find('.stock-or-atp-region');

  if (!ribbonContainer.find('.non-stock-banner').length) {
    ribbonContainer.prepend(
      "<div class='private-label non-stock-banner' style='background-color:#FF8C00'>Non-Stock</div>"
    );
  }

  if (
    !stockContainer.find('.non-stock-text').length &&
    !stockContainer.find('.stocked-text-oos').length
  ) {
    stockContainer.append(
      "<div class='non-stock-text' style='color:red'>ETA - Shipping 2-3 weeks.</div>"
    );
  }
};

/* ================================
   CMS100MI Inventory Lookup
================================ */
window.fetchItemWarehouseRhythm = async function (itno) {
  const url = `${window.g_CMS100MI_LstItmWhsRTHM}${encodeURIComponent(itno)}`;
  const data = await window.fetchJson(url);
  return data?.results?.[0]?.records || [];
};

/* ================================
   Check Non-Stock Status
================================ */
window.isNonStock = async function (itno, warehouseList) {
  await window.updateDescription(itno);
  try {
    const records = await window.fetchItemWarehouseRhythm(itno);
 
    console.log("Item:", itno);
    console.log("Account Warehouses:", warehouseList);

    records.forEach(rec => {
      console.log({
        warehouse: rec.MBWHLO,
        stockFlag: rec.V_STOC,
        matchesAccount: warehouseList.includes(
          rec.MBWHLO?.toString().trim()
        )
      });
    });

    if (!records.length) {
      window.displayNonStockBanner(itno);
      return true;
    }

    const hasStock = records.some(rec => {
      const warehouse = rec.MBWHLO?.toString().trim();
      const stockFlag = rec.V_STOC?.toString().trim();

      return warehouseList.includes(warehouse) && stockFlag !== "N";
    });

    if (!hasStock) {
      window.displayNonStockBanner(itno);
    }

    return !hasStock;
  } catch (error) {
    console.error(`isNonStock() error -> ${error}`);
    window.displayNonStockBanner(itno);
    return true;
  }
};

/* ================================
   Get All Inventory
================================ */
window.getAllInventory = async function (items) {
  const warehouseIds = window.getStoredWarehouseIds();

  for (const itno of items) {
    try {
      if (!warehouseIds.length) {
        window.displayNonStockBanner(itno);
        continue;
      }

      await window.isNonStock(itno, warehouseIds);
    } catch (error) {
      console.error(`Error checking inventory for ${itno}`, error);
      window.displayNonStockBanner(itno);
    }
  }
};

/* ================================
   Watch Product Cards
================================ */
window.watchProductCards = function () {
  const productCardSelector = '.product-card';
  let productIds = [];

  const getProductIds = function () {
    return Array.from(document.querySelectorAll(productCardSelector))
      .map(card => card.id)
      .filter(Boolean);
  };

  const checkForChanges = function () {
    const newIds = getProductIds();

    const hasChanged =
      newIds.length !== productIds.length ||
      !newIds.every((id, index) => id === productIds[index]);

    if (hasChanged) {
      productIds = newIds;
      window.getAllInventory(productIds);
    }
  };

  const observer = new MutationObserver(function () {
    if (document.querySelector('.products.grid')) {
      checkForChanges();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  productIds = getProductIds();
  window.getAllInventory(productIds);
};

/* ================================
   Color Swatch Transformation
================================ */
window.applySwatchTransformation = function () {
  const colorFamilyList = document.querySelector("#pmdm\\.at\\.colorfamily");

  if (!colorFamilyList) return;

  colorFamilyList.querySelectorAll(".input-checkbox + label").forEach(label => {
    const checkbox = label.previousElementSibling;

    if (!checkbox || label.querySelector(".color-swatch")) return;

    const color = checkbox.value.toLowerCase();

    const colorMap = {
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

    if (!colorMap[color]) return;

    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";
    label.style.cursor = "pointer";

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.width = "25px";
    swatch.style.height = "25px";
    swatch.style.borderRadius = "5px";
    swatch.style.border = "1px solid #ccc";
    swatch.style.background = colorMap[color];

    const quantityMatch = label.textContent.match(/\(\d+\)/);
    const quantityText = quantityMatch ? quantityMatch[0] : "";

    label.textContent = quantityText;
    label.insertBefore(swatch, label.firstChild);
    label.title = checkbox.value;

    const updateSwatchBorder = function () {
      swatch.style.border = checkbox.checked ? "3px solid #000" : "1px solid #ccc";
    };

    updateSwatchBorder();
    checkbox.addEventListener("change", updateSwatchBorder);
  });
};

window.observeDOMChanges = function () {
  window.applySwatchTransformation();

  const observer = new MutationObserver(function () {
    window.applySwatchTransformation();
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

/* ================================
   Initialize on Document Ready
================================ */
$(document).ready(async function () {
  await window.fetchWarehouses();
  window.watchProductCards();
  window.observeDOMChanges();
});