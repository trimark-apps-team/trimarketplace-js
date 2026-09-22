// === GLOBAL INITIALIZATION ===
$(document).ready(async function () {
  try {
    await window.loadWarehouses();
    await window.setProductDescriptionToItemName();
    await window.getItemWarehouseInfo();
    window.watchPDPChanges(); 
    window.openPdfLinksInNewWindow();
  } catch (err) {
    console.error("Initialization error:", err);
  }
});

// === GLOBAL CONFIG ===
window.g_CMS100MI_LstItmWhsRTHM = "/o/generic-api/CMS100MI_LstItmWhsRTHM?MBITNO=";

// === HELPERS ===
window.getCurrentItemNumber = () => {
  const widgetInstance =
    window.App?.WidgetsContainer?.["rhythm-ecom-productdetails-portlet"]?.instance;

  return (
    widgetInstance?.productDetailModel?.id ||
    widgetInstance?.productDetailModel?.attributes?.id ||
    null
  );
};

window.waitForCurrentItemNumber = async function (maxAttempts = 8, delay = 300) {
  let itno = window.getCurrentItemNumber();

  for (let i = 0; i < maxAttempts && !itno; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    itno = window.getCurrentItemNumber();
  }

  return itno;
};

window.removeStockMessages = () => {
  $(".low-shipping").remove();
  $(".stocked-text-oos").remove();
  $(".non-stock-banner").remove();
};

window.openPdfLinksInNewWindow = () => {
  $(".download a").each(function () {
    $(this).removeAttr("download").attr("target", "_blank");
  });
};

// === FEATURE BULLETS ===
window.addBulletToDescription = (featureBullets) => {
  if (!featureBullets?.length) return;

  const productDescriptionDiv = document.querySelector(".product-description");
  if (!productDescriptionDiv || document.querySelector(".feature-bullets")) return;

  const bulletList = document.createElement("ul");
  bulletList.classList.add("feature-bullets");
  bulletList.style.listStyleType = "disc";
  bulletList.style.paddingLeft = "20px";
  bulletList.style.paddingTop = "10px";
  bulletList.style.color = "black";

  featureBullets.forEach((bullet) => {
    const value = bullet.values?.[0] || bullet.value || "";
    if (!value) return;

    const li = document.createElement("li");
    li.textContent = value;
    li.style.marginBottom = "5px";
    bulletList.appendChild(li);
  });

console.log(bulletList);
console.log('bulletList');

  productDescriptionDiv.appendChild(bulletList);
};

// === WAREHOUSES ===
window.getWarehouses = async () => {
  const res = await fetch("/delegate/ecom-api/warehouses?size=100");
  if (!res.ok) throw new Error(`Warehouse request failed: ${res.status}`);
  return await res.json();
};

window.loadWarehouses = async () => {
  try {
    const data = await window.getWarehouses();
    const warehouseList = data
      .map((w) => w.id?.toString().trim())
      .filter(Boolean);

    $("body").data({ warehouses: warehouseList });
    return warehouseList;
  } catch (err) {
    console.error("Error loading warehouses:", err);
    $("body").data({ warehouses: [] });
    return [];
  }
};

// === STOCK CHECK ===
window.isNonStock = async (itno, warehouseList) => {
  try {
    const url = `${window.g_CMS100MI_LstItmWhsRTHM}${encodeURIComponent(itno)}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Stock request failed`);

    const data = await res.json();
    const records = data?.results?.[0]?.records || [];

        records.forEach((rec) => {
      console.log({
        item: itno,
        warehouse: rec.MBWHLO,
        stockFlag: rec.V_STOC,
        matchesAccount: warehouseList.includes(
          rec.MBWHLO?.toString().trim()
        )
      });
    });

    if (!records.length) return true;

    const hasStock = records.some((rec) => {
      const warehouse = rec.MBWHLO?.toString().trim();
      const stockFlag = rec.V_STOC?.toString().trim();
      return warehouseList.includes(warehouse) && stockFlag !== "N";
    });

    return !hasStock;
  } catch (error) {
    console.error("Stock check error:", error);
    return true;
  }
};

// === STOCK UI ===
window.renderNonStockUI = () => {
  const itemNumber = $(".item-number").first();
  const shippingInformation = $(".product-information .availability-feature").first();

  const bannerHtml = `
    <div class="non-stock-banner"
         style="
           display:inline-block;
           margin:10px 0;
           padding:6px 12px;
           background:#FF8C00;
           color:#fff;
           font-weight:700;
           border-radius:4px;
         ">
      Non-Stock
    </div>
  `;

  const lowShippingText = `
    <p class="low-shipping"
       style="margin-top:10px;color:#a12641;font-style:italic;">
      ETA - Shipping 2-3 weeks
    </p>
  `;

  if (itemNumber.length && !$(".non-stock-banner").length) {
    itemNumber.after(bannerHtml);
  }

  if (shippingInformation.length && !shippingInformation.find(".low-shipping").length) {
    shippingInformation.append(lowShippingText);
  }
};

window.renderStockedUI = () => {
  const stockText = $(".stock-text");

  $(".non-stock-banner").remove();
  $(".low-shipping").remove();

  if (stockText.length && !stockText.text().includes("quantity")) {
    stockText.text(`${stockText.text()} quantity`);
  }

  if (stockText.length && !stockText.find(".stocked-text-oos").length) {
    stockText.append(
      "<div class='stocked-text-oos'><b>ETA - Shipping 2-3 days</b></div>"
    );
  }
};

// === PDP STOCK FLOW ===
window.getItemWarehouseInfo = async () => {
  try {
    const warehouseList = $("body").data("warehouses") || [];
    const itno = await window.waitForCurrentItemNumber();

    if (!itno) return;

    const nonStock = await window.isNonStock(itno, warehouseList);

    window.removeStockMessages();


// Give the PDP time to finish rendering
await new Promise(resolve => setTimeout(resolve, 1000));

if (nonStock) {
  window.renderNonStockUI();
} else {
  window.renderStockedUI();
}


  } catch (error) {
    console.error("PDP stock error:", error);
  }
};

// === WATCH FOR PDP RE-RENDER ===
window.watchPDPChanges = function () {
  let lastItem = null;

  const observer = new MutationObserver(async function () {
    const itno = window.getCurrentItemNumber();

    if (!itno || itno === lastItem) return;

    lastItem = itno;

    //console.log("PDP changed → rechecking:", itno);

    await window.getItemWarehouseInfo();
    await window.setProductDescriptionToItemName();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// === PRODUCT ATTRIBUTES ===
window.setProductDescriptionToItemName = async () => {
  try {
    const itno = await window.waitForCurrentItemNumber();
    if (!itno) return;

    const res = await fetch(`/delegate/ecom-api/items/${encodeURIComponent(itno)}/attributes?size=-1`);
    if (!res.ok) throw new Error("Attributes request failed");

    const data = await res.json();

    const brand = data.find((obj) => obj.name === "Brand");
    const brandName = brand?.values?.[0];

    const featureBullets = data.filter((obj) =>
      [
        "PMDM.AT.FeatureBullet1",
        "PMDM.AT.FeatureBullet2",
        "PMDM.AT.FeatureBullet3"
      ].includes(obj.key)
    );

    if (brandName) {
      const ul = document.querySelector("ul.brand-manufacturer");
      if (ul && ul.children.length === 0) {
        const li = document.createElement("li");
        li.innerHTML = `<p class="value">Brand: ${brandName}</p>`;
        ul.appendChild(li);
      }
    }

    if (featureBullets.length) {
      await window.addBulletToDescription(featureBullets);
    }
  } catch (error) {
    console.error("Attributes error:", error);
  }
};