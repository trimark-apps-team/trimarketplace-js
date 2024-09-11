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
      sessionStorage.setItem('salesEmail', data.results[0].records[0].EMAL)
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
  // remove the session storage items on initial page ready so we can reset
  sessionStorage.removeItem('customerEmail')
  sessionStorage.removeItem('salesEmail')
  sessionStorage.removeItem('companyName')
  sessionStorage.removeItem('companyNumber')
  dspSaleInfo()

  // *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
// begin post to hubspot forms api after successful login so we can capture the user as a contact in hubspot. 
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
      if (parts.length == 2){
          return parts.pop().split(";").shift();
      }     
};
function buildHSContext() {
let hsContext = new Object()
hsContext.hutk = getCookie('hubspotutk');
hsContext.pageUri = window.location.href;
hsContext.pageName = document.title;
return hsContext
}

function prepareHSFormSubmission(customerName, customerNumber) {
var submissionData = new Object()
submissionData.submittedAt = Date.now()
submissionData.fields = [
  {"name":"email","value": Liferay.ThemeDisplay.getUserEmailAddress()}, 
  {"name":"customer_name","value": customerName},
  {"name":"customer_number","value": customerNumber}
]
submissionData.context = buildHSContext()
return submissionData
}

async function postData(url = '', data = {}) {
// Default options are marked with *
const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
        'Content-Type': 'application/json'
         // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
return response.json() // parses JSON response into native JS objects
}

function submitHSForm(hsFormURL, data) {
  postData(hsFormURL, data).then(data => {
      if(data){
          console.log(data)
      }  
  });
}
  $.get("/delegate/ecom-api/users/current", function (data) {
    sessionStorage.setItem('customerNumber', data.activeUserGroup.customerNumber)
    sessionStorage.setItem('customerEmail', data.email)
    sessionStorage.setItem('companyName', data.activeUserGroup.name)
  });




  var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
  var prodPortalId = '9416274'
  var qaPortalId = '20922853'
    // Add the HubSpot form GUID from your HubSpot portal
    var prodFormGuid = '9c4843e5-fa59-4d69-a685-39655fa05a50' 
    var qaformGuid = '2cfec285-66e3-4121-b71b-e4c0bde110db' 
    var submitURL = ''
    if(window.location.href.includes('qa.')) {
      submitURL = `${baseSubmitURL}/${qaPortalId}/${qaformGuid}`
    }
    else if(window.location.href.includes('shop.')) {
      submitURL = `${baseSubmitURL}/${prodPortalId}/${prodFormGuid}`
    }
    

    setTimeout(function() {
      var formData = prepareHSFormSubmission(sessionStorage.getItem('customerName'), sessionStorage.getItem('customerNumber'));
      submitHSForm(submitURL, formData)
    }, 300)
    


});
// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*

// ===========================================================
// ===========================================================
// END OF Display salesperson information
// ===========================================================
// ===========================================================