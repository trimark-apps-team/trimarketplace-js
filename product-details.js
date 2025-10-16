// === GLOBAL INITIALIZATION ===
$(document).ready(function () {
  setTimeout(window.loadWarehouses, 1500);
  setTimeout(window.setProductDescriptionToItemName, 1000);
  setTimeout(window.openPdfLinksInNewWindow, 2000);
});

// === GLOBAL FUNCTIONS ===

// Add bullets to product description
window.addBulletToDecription = (featureBullets) => {
  if (!featureBullets?.length) return;

  const productDescriptionDiv = document.querySelector(".product-description");
  if (!productDescriptionDiv) return;

  const bulletList = document.createElement("ul");
  bulletList.classList.add("feature-bullets");
  bulletList.style.listStyleType = "disc";
  bulletList.style.paddingLeft = "20px";
  bulletList.style.paddingTop = "10px";
  bulletList.style.color = "black";

  featureBullets.forEach((bullet) => {
    const li = document.createElement("li");
    li.textContent = bullet.values?.[0] || bullet.value || "";
    li.style.marginBottom = "5px";
    bulletList.appendChild(li);
  });

  productDescriptionDiv.appendChild(bulletList);
};

// Display standard logos with sprite positions
window.displayStandardsWithSprites = (standards) => {
  const standardPositions = {
    "Energy Star": "-10px -10px",
    "Design Certified": "-100px -200px",
    "cETLus": "-100px -300px",
    "NSF Certified": "-120px -130px",
    "NSF": "-120px -130px",
    "Made in America": "-100px -200px",
    "cULus": "-235px -227px",
    "UL": "-10px -239px",
    "UL Classified": "-10px -239px",
    "ETL": "-100px -228px",
  };

  const standardsContainer = document.createElement("div");
  standardsContainer.classList.add("standards-container");
  standardsContainer.style.textAlign = "right";
  standardsContainer.style.marginRight = "50px";

  let found = false;
  standards.forEach((item) => {
    const value = item.values?.[0];
    if (standardPositions[value]) {
      found = true;
      const span = document.createElement("span");
      span.classList.add("swatch-sprite");
      span.style.backgroundImage =
        "url('/webdav/shop.trimarketplace.com/document_library/Standard_Logos/logo_swatch.png')";
      span.style.backgroundRepeat = "no-repeat";
      span.style.width = "100px";
      span.style.height = "100px";
      span.style.display = "inline-block";
      span.style.marginRight = "5px";
      span.style.backgroundPosition = standardPositions[value];
      standardsContainer.appendChild(span);
    }
  });

  if (found) {
    const itemNumberDiv = document.querySelector(".item-number");
    itemNumberDiv?.insertAdjacentElement("afterend", standardsContainer);
  }
};

// Add brand name to brand list
window.addBrand = (brand) => {
  const ul = document.querySelector("ul.brand-manufacturer");
  if (ul && ul.children.length === 0) {
    const li = document.createElement("li");
    li.textContent = `Brand: ${brand}`;
    ul.appendChild(li);
  }
};

// Open PDF links in a new window
window.openPdfLinksInNewWindow = () => {
  $(".download a").each(function () {
    const link = $(this);
    link.removeAttr("download");
    link.attr("target", "_blank");
  });
};

// Fetch and store warehouses
window.loadWarehouses = async () => {
  try {
    const data = await window.getWarehouses();
    const warehouseList = data.map((w) => w.id);
    $("body").data({ warehouses: warehouseList });
    await window.getItemWarehouseInfo();
  } catch (err) {
    console.error("Error loading warehouses:", err);
  }
};

// Get item warehouse info
window.getItemWarehouseInfo = async () => {
  try {
    const warehouses = $("body").data("warehouses");
    const widgetInstance =
      window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"]?.instance;
    const itno = widgetInstance?.productDetailModel?.id;

    const result = await window.isNonStock(itno, warehouses);
    const shippingInformation = $(".product-information .shipping-information");
    const ribbonLabel = $(".ribbon-container");

    const lowShippingText = `<p class="low-shipping" style="margin-top:10px;color:#a12641"><i>ETA - Shipping 2-3 weeks</i></p>`;
    const hasNoStock = $(".title").text().includes("No Stock");

    if (result && !hasNoStock) {
      $(".ribbon-container").css("display", "block");
      if (!ribbonLabel.find("p.non-stock-pdp").length) {
        ribbonLabel.prepend(`<p class="non-stock-pdp" style="width: 100px">Non-Stock</p>`);
      }
      shippingInformation.append(lowShippingText);
      $(".title").hide();
    } else if (!result && hasNoStock) {
      // do nothing
    } else {
      const stockText = $(".stock-text");
      stockText.text(`${stockText.text()} quantity`);
      stockText.append(
        "<div class='stocked-text-oos' style='display:block'><b>ETA - Shipping 2-3 days</b></div>"
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Determine if product is non-stock
window.isNonStock = async (itno, warehouseList) => {
  const g_EXPORTMI_MITBAL = "/o/generic-api/EXPORTMI_MITBAL?qery=";
  const querystr = `MBCONO,MBITNO,MBWHLO,MBIPLA,MBOPLC[ ]from[ ]MITBAL[ ]where[ ]MBCONO[ ]=[ ]200[ ]and[ ]MBITNO[ ]=[ ][']${itno}[']`;
  const apiurl = g_EXPORTMI_MITBAL + querystr;

  try {
    const res = await fetch(apiurl);
    const data = await res.json();
    const hasStock = data.results[0].records.some((rec) => {
      const repl = rec.REPL.toString().split(";");
      return repl[4] === "1" && warehouseList.includes(repl[2]);
    });
    return !hasStock;
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
};

// Get warehouse list
window.getWarehouses = async () => {
  try {
    const res = await fetch("/delegate/ecom-api/warehouses?size=100");
    return await res.json();
  } catch (error) {
    console.error("(error)->", error);
    throw error;
  }
};

// Set product description and features
window.setProductDescriptionToItemName = async () => {
  const widgetInstance =
    window.App.WidgetsContainer["rhythm-ecom-productdetails-portlet"]?.instance;
  const itno = widgetInstance?.productDetailModel?.attributes?.id;
  const apiUrl = `/delegate/ecom-api/items/${itno}/attributes?size=-1`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    const brand = data.find((obj) => obj.name === "Brand");
    const brandName = brand?.values?.[0];
    const standards = data.filter((obj) => obj.key === "PMDM.AT.Standards");
    const featureBullets = data.filter((obj) =>
      ["PMDM.AT.FeatureBullet1", "PMDM.AT.FeatureBullet2", "PMDM.AT.FeatureBullet3"].includes(
        obj.key
      )
    );
    const discontinued = data.find((obj) => obj.key === "PMDM.AT.DISCONTINUE");

    if (brandName) window.addBrand(brandName);
    if (standards.length) window.displayStandardsWithSprites(standards);
    if (featureBullets.length) window.addBulletToDecription(featureBullets);

    if (discontinued) {
      $(".ribbon-container").prepend('<p class="item-discontinued">Limited Stock Available</p>');
    }
  } catch (error) {
    console.error("(error)->", error);
  }
};
