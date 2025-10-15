// ===========================================================
// TriMark Marketplace - User Email & Salesperson Info
// ===========================================================

// ----------------------
// Set user email in UI
// ----------------------
window.setUserEmail = function () {
  const userEmail = window.Liferay?.ThemeDisplay?.getUserEmailAddress?.() ?? "";

  if (!$('.user-email').length) {
      $('.user-component-container:first').append(`<div class='user-email'><span>Email:</span> ${userEmail}</div>`);
  }
};

// ----------------------
// MutationObserver for user email
// ----------------------
window.userEmailObserverConfig = { childList: true, characterData: true, subtree: true, attributes: true };

window.userEmailObserverCallback = function () {
  window.setUserEmail();
};

window.userEmailObserver = new MutationObserver(window.userEmailObserverCallback);
if (document.body) {
  window.userEmailObserver.observe(document.body, window.userEmailObserverConfig);
}

// ===========================================================
// Display salesperson information
// ===========================================================
window.g_crs610_GetOrderInfo = '/o/generic-api/GetOrderInfo?cuno=';
window.g_mns150_GetUserData = '/o/generic-api/GetUserData?usid=';

// -----------------------------------------------------------
// Get salesperson info for current user
// -----------------------------------------------------------
window.dspSaleInfo = function () {
  if (!window.g_curUser) {
      setTimeout(window.dspSaleInfo, 200);
      return;
  }

  const ele = $('.rhy.widget__rhythmecomcustomerservicecontactinfoportlet_WAR_rhythmecomcustomerservicecontactinfoportlet_ .dashboard-container.customer-service')[0];
  if (!ele) return;

  const custnbr = window.g_curUser.activeUserGroup.customerNumber;
  const apiurl = window.g_crs610_GetOrderInfo + custnbr;

  fetch(apiurl)
      .then(res => res.json())
      .then(data => {
          if (data.nrOfSuccessfullTransactions > 0) {
              const smcd = data.results[0].records[0].SMCD;
              if (smcd) window.getSalesmanDetail(smcd);
          } else {
              console.error("CRS610MI Error:", data.results[0]);
          }
      })
      .catch(err => console.error(`dspSaleInfo(error)->${err}`));
};

// -----------------------------------------------------------
// Get salesperson details and render in UI
// -----------------------------------------------------------
window.getSalesmanDetail = function (smcd) {
  const apiurl = window.g_mns150_GetUserData + smcd;

  fetch(apiurl)
      .then(res => res.json())
      .then(data => {
          if (data.nrOfSuccessfullTransactions > 0) {
              const record = data.results[0].records[0];
              const sname = record.NAME;
              const semail = record.EMAL;
              const sphone = record.PHNO;

              sessionStorage.setItem('salesEmail', semail);

              let wc = window.getArticleX("SALESCONTACT");
              wc = wc.replace("$.name$", sname)
                  .replace("$.email$", semail)
                  .replace("$.phone$", sphone);

              const ele = $('.rhy.widget__rhythmecomcustomerservicecontactinfoportlet_WAR_rhythmecomcustomerservicecontactinfoportlet_ .dashboard-container.customer-service ul')[0];
              if (ele) $(ele).prepend(wc);
          } else {
              console.error("MNS150MI Error:", data.results[0]);
          }
      })
      .catch(err => console.error(`getSalesmanDetail(error)->${err}`));
};

// ===========================================================
// HubSpot form submission after login
// ===========================================================
window.getCookie = function(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

window.buildHSContext = function () {
  return {
      hutk: window.getCookie('hubspotutk'),
      pageUri: window.location.href,
      pageName: document.title
  };
};

window.prepareHSFormSubmission = function(customerName, customerNumber) {
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

window.postData = async function(url = '', data = {}) {
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

window.submitHSForm = function(hsFormURL, data) {
  window.postData(hsFormURL, data).then(res => console.log(res));
};

// ===========================================================
// Initialization
// ===========================================================
$(document).ready(function () {
  // Clear session storage
  sessionStorage.removeItem('customerEmail');
  sessionStorage.removeItem('salesEmail');
  sessionStorage.removeItem('companyName');
  sessionStorage.removeItem('companyNumber');

  // Fetch current user info
  $.get("/delegate/ecom-api/users/current", function (data) {
      window.g_curUser = data; // set global user variable
      sessionStorage.setItem('customerNumber', data.activeUserGroup.customerNumber);
      sessionStorage.setItem('customerEmail', data.email);
      sessionStorage.setItem('companyName', data.activeUserGroup.name);

      // Initialize salesperson info
      window.dspSaleInfo();

      // HubSpot form submission
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

      setTimeout(() => {
          const formData = window.prepareHSFormSubmission(
              sessionStorage.getItem('companyName'),
              sessionStorage.getItem('customerNumber')
          );
          window.submitHSForm(submitURL, formData);
      }, 1000);
  });
});
