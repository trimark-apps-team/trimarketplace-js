/* ===========================================================
   USER EMAIL DISPLAY + OBSERVER
=========================================================== */

window.setUserEmail = function () {
  const userEmail = window.Liferay?.ThemeDisplay?.getUserEmailAddress?.() ?? "";
  if (!$('.user-email').length && userEmail) {
    $('.user-component-container:first').append(
      `<div class='user-email'><span>Email:</span> ${userEmail}</div>`
    );
  }
};

// Setup observer
(function () {
  const targetNode = document.body;
  if (!targetNode) return;

  const observerConfig = { childList: true, characterData: true, subtree: true, attributes: true };
  const observerCallback = () => window.setUserEmail();

  const observer = new MutationObserver(observerCallback);
  observer.observe(targetNode, observerConfig);
})();

/* ===========================================================
   DISPLAY SALESPERSON INFORMATION
=========================================================== */

window.g_crs610_GetOrderInfo = '/o/generic-api/GetOrderInfo?cuno=';
window.g_mns150_GetUserData = '/o/generic-api/GetUserData?usid=';

window.dspSaleInfo = function () {
  const ele = $('.rhy .customer-service .details')[0];
  if (!ele || !window.g_curUser) {
    setTimeout(window.dspSaleInfo, 200);
    return;
  }

  const custnbr = window.g_curUser.activeUserGroup.customerNumber;
  const apiurl = window.g_crs610_GetOrderInfo + custnbr;

  fetch(apiurl, { method: "GET" })
    .then(res => res.json())
    .then(data => {
      if (data.nrOfSuccessfullTransactions > 0) {
        const smcd = data.results[0].records[0].SMCD;
        if (smcd) window.getSalesmanDetail(smcd);
      } else {
        console.warn("CRS610MI API Error:", data.results[0]);
      }
    })
    .catch(error => console.error(`dspSaleInfo() error -> ${error}`));
};

window.getSalesmanDetail = function (smcd) {
  const apiurl = window.g_mns150_GetUserData + smcd;

  fetch(apiurl, { method: "GET" })
    .then(res => res.json())
    .then(data => {
      if (data.nrOfSuccessfullTransactions > 0) {
        const rec = data.results[0].records[0];
        const sname = rec.NAME;
        const semail = rec.EMAL;
        const sphone = rec.PHNO;

        sessionStorage.setItem('salesEmail', semail);
        sessionStorage.setItem('salesEmail', data.results[0].records[0].EMAL);

        if (data.nrOfSuccessfullTransactions > 0) {
          let sname = data.results[0].records[0].NAME;
          let semail = data.results[0].records[0].EMAL;
          let sphone = data.results[0].records[0].PHNO;

          if (sname && sname.includes(',')) {
            const parts = sname.split(',').map(p => p.trim());
            if (parts.length === 2) {
              sname = `${parts[1]} ${parts[0]}`; // "Firstname Lastname"
            }
          }

          const salespersonLi = `
            <li class="salesperson">
              <label>Sales Representative</label>
              <div class="formatted-salesperson">
                <div class="name">${sname || ''}</div>
                <div>
                  ${semail ? `<a class="email link-primary" href="mailto:${semail}">${semail}</a>` : ''}
                </div>
                <div class="phone">${sphone || ''}</div>
              </div>
            </li>
          `;

          // Prepend it inside the .rhy .customer-service .details element
          $('.rhy .customer-service .details').prepend(salespersonLi);
        } else {
          console.warn("MNS150MI API Error:", data.results[0]);
        }
      }
    })
    .catch(error => console.error(`getSalesmanDetail() error -> ${error}`));
};

/* ===========================================================
   HUBSPOT FORM SUBMISSION
=========================================================== */

window.getCookie = function (name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  return parts.length === 2 ? parts.pop().split(";").shift() : null;
};

window.buildHSContext = function () {
  return {
    hutk: window.getCookie('hubspotutk'),
    pageUri: window.location.href,
    pageName: document.title
  };
};

window.prepareHSFormSubmission = function (customerName, customerNumber) {
  return {
    submittedAt: Date.now(),
    fields: [
      { name: "email", value: window.Liferay?.ThemeDisplay?.getUserEmailAddress?.() ?? "" },
      { name: "rhythm_company_name", value: customerName },
      { name: "rhythm_company_number", value: customerNumber }
    ],
    context: window.buildHSContext()
  };
};

window.postData = async function (url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return response.json();
};

window.submitHSForm = function (hsFormURL, data) {
  window.postData(hsFormURL, data).then(response => {
    if (response) console.log("HubSpot submission response:", response);
  });
};

/* ===========================================================
   INITIALIZATION
=========================================================== */
$(document).ready(function () {
  // Reset stored values
  sessionStorage.removeItem('customerEmail');
  sessionStorage.removeItem('salesEmail');
  sessionStorage.removeItem('companyName');
  sessionStorage.removeItem('companyNumber');

  // Load salesperson info
  window.dspSaleInfo();

  // Retrieve current user info
  $.get("/delegate/ecom-api/users/current", function (data) {
    sessionStorage.setItem('customerNumber', data.activeUserGroup.customerNumber);
    sessionStorage.setItem('customerEmail', data.email);
    sessionStorage.setItem('companyName', data.activeUserGroup.name);
  });

  // HubSpot settings
  const baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit';
  const prodPortalId = '9416274';
  const qaPortalId = '20922853';
  const prodFormGuid = '9c4843e5-fa59-4d69-a685-39655fa05a50';
  const qaFormGuid = '2cfec285-66e3-4121-b71b-e4c0bde110db';

  let submitURL = '';
  if (window.location.href.includes('qa.')) {
    submitURL = `${baseSubmitURL}/${qaPortalId}/${qaFormGuid}`;
  } else if (window.location.href.includes('shop.')) {
    submitURL = `${baseSubmitURL}/${prodPortalId}/${prodFormGuid}`;
  }

  // Delay HubSpot submission slightly
  setTimeout(function () {
    const formData = window.prepareHSFormSubmission(
      sessionStorage.getItem('companyName'),
      sessionStorage.getItem('customerNumber')
    );
    if (submitURL) window.submitHSForm(submitURL, formData);
  }, 1000);
});


/* ===========================================================
   USER COMPANY DISPLAY + OBSERVER
=========================================================== */

window.setCompanyInfo = function () {
  const companyName = sessionStorage.getItem("companyName") || "";
  const customerNumber = sessionStorage.getItem("customerNumber") || "";

  if (!companyName && !companyNumber) return;

  // Only insert if not already present
  const container = $('.user-component.user-company .user-component-container:first');
  if (!container.length) return;

  // Check if already added
  if (!container.find('.company-info').length) {
    let html = '';
    if (companyName) html += `<div class='company-name'><span style='font-weight:600;'>${companyName}</span></div>`;
    if (customerNumber) html += `<div class='company-number'><span style='margin-top:5px;'>Company ID:</span> ${customerNumber}</div>`;
    container.append(`<div class='company-info'>${html}</div>`);
  }
};

// Setup observer for company container
(function () {
  const targetNode = document.body;
  if (!targetNode) return;

  const observerConfig = { childList: true, subtree: true, characterData: true, attributes: true };

  const observerCallback = () => window.setCompanyInfo();

  const observer = new MutationObserver(observerCallback);
  observer.observe(targetNode, observerConfig);
})();