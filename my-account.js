const setUserEmail = () => {
  const userEmail = Liferay.ThemeDisplay.getUserEmailAddress();

  if (!$('.user-email').length) {
    $('.user-component-container:first').append(`<div class='user-email'><span>Email:</span> ${userEmail}</div>`);
  }
}

// define the target node
var targetNode = document.body;

// configuration of the observer
const config = { childList: true, characterData: true, subtree: true, attributes: true, };

// callback function
const callback = function (mutationsList, observer) {
  hideExtraAddresses();
  setUserEmail();
};
// Create observer instance
const observer = new MutationObserver(callback);

// pass in the target node and configuration observer.observe(targetNode, config);
if (targetNode) {
  observer.observe(targetNode, config);
}

hideExtraAddresses = () => {
  if (!$(".shipping-content").hasClass("expanded")) {
    $(".content-toggler").click().hide();
    $(".shipping-content").addClass("expanded");
    $(".header-content").hide();
    $("#user-favorite-icon").hide();
  }
}

$(document).ready(function () {

  hideExtraAddresses();
});


// ===========================================================
// ===========================================================
// Display salesperson information
// Author: Infor
// Date: 7/27/23
// ===========================================================
// ===========================================================

var g_crs610_GetOrderInfo = '/o/generic-api/GetOrderInfo?cuno=';
var g_mns150_GetUserData = '/o/generic-api/GetUserData?usid=';

//--------------------------------------------------
function dspSaleInfo() {
  let timeoutvar4dspSaleInfo;

  let ele = $('.rhy.widget__rhythmecomcustomerservicecontactinfoportlet_WAR_rhythmecomcustomerservicecontactinfoportlet_ .dashboard-container.customer-service')[0];

  if (ele != null && g_curUser != null) {
    let custnbr = g_curUser.activeUserGroup.customerNumber;
    let smcd = null;

    // call m3 api to get salesman
    let apiurl = g_crs610_GetOrderInfo + custnbr;
    fetch(apiurl, {
      method: "GET"
    })
      .then((res) => res.json())		//  convert response to json
      .then(function (data) {

        if (data.nrOfSuccessfullTransactions > 0) {
          smcd = data.results[0].records[0].SMCD;


          if (smcd != null && smcd != "") {
            // Get salesman details
            getSalesmanDetail(smcd);

          }

        }
        else {
          // error
          let errstr = "M3 API-> CRS610MI\n";
          errstr += "Transaction-> " + data.results[0].transaction + "\n";
          errstr += "Error Type-> " + data.results[0].errorType + "\n";
          errstr += "Error Code-> " + data.results[0].errorCode + "\n";
          errstr += "Error Message-> " + data.results[0].errorMessage + "\n";
          errstr += "Error Field-> " + data.results[0].errorField;
          console.log(errstr);
        }

      })
      .catch(function (error) {
        console.log(`dspSaleInfo(error)->${error}`);

      }); // end rhythm enpoint call	

  }
  else {
    timeoutvar4dspSaleInfo = setTimeout(dspSaleInfo, 200);
  }
}


//--------------------------------------------------
function getSalesmanDetail(smcd) {

  // call m3 api to get salesman detail
  let apiurl = g_mns150_GetUserData + smcd;

  fetch(apiurl, {
    method: "GET"
  })
    .then((res) => res.json())		//  convert response to json
    .then(function (data) {
      sessionStorage.setItem('salesEmail', data.results[0].records[0].NAME)
      if (data.nrOfSuccessfullTransactions > 0) {
        let sname = data.results[0].records[0].NAME;
        let semail = data.results[0].records[0].EMAL;
        let sphone = data.results[0].records[0].PHNO;

        // get web content
        let wc = getArticleX("SALESCONTACT");
        // replace parameters with values
        wc = wc.replace("$.name$", sname)
          .replace("$.email$", semail)
          .replace("$.phone$", sphone);

        // display on page
        let ele = $('.rhy.widget__rhythmecomcustomerservicecontactinfoportlet_WAR_rhythmecomcustomerservicecontactinfoportlet_ .dashboard-container.customer-service ul')[0];
        $(ele).prepend(wc);
        console.log(semail)
        sessionStorage.setItem('salesEmail', semail)
      }
      else {
        // error
        let errstr = "M3 API-> MNS150MI\n";
        errstr += "Transaction-> " + data.results[0].transaction + "\n";
        errstr += "Error Type-> " + data.results[0].errorType + "\n";
        errstr += "Error Code-> " + data.results[0].errorCode + "\n";
        errstr += "Error Message-> " + data.results[0].errorMessage + "\n";
        errstr += "Error Field-> " + data.results[0].errorField;
        //console.log(errstr);
      }

    })
    .catch(function (error) {
      console.log(`getSalesmanDetail(error)->${error}`);

    }); // end rhythm enpoint call	
}


// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
// Initialization
$('document').ready(function () {

  dspSaleInfo()
  const customerEmail = $(".user-email").text().split('Email:')
  let formattedEmail = customerEmail[1].replace(/\s+/g,'');
  console.log(formattedEmail)
  sessionStorage.setItem('customerEmail', formattedEmail)

});
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*

// ===========================================================
// ===========================================================
// END OF Display salesperson information
// ===========================================================
// ===========================================================