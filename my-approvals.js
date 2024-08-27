$(window).on('load', function () {
    // sometimes take a few seconds for statuses to load in DOM
    // TODO: find better way to handle this
    // remove these session storage values initially when visiting page.
    sessionStorage.removeItem('has_pending_approval')
    sessionStorage.removeItem('triggerPendingApproval')
    
    let rejectButton = $(".reject-btn");
    setTimeout(setStatusColor, 0);
    //setTimeout(setStatusColor, 1000 );
    //setTimeout(setStatusColor, 2000 );

    // on page load check for pending approvals
    checkPendingApprovals()


});

addEventListener("DOMNodeInserted", (event) => {
    setStatusColor();
});

setStatusColor = () => {
    $('.status-value').each(function (index, item) {
        if (item.innerText === "Approved") {
            item.style.color = "#198E56"; //TM Green
        } else if (item.innerText === "Pending") {
            item.style.color = "#C9AA10";
        } else if (item.innerText === "Rejected") {
            item.style.color = "#C03326";
        }
    });
}



const checkPendingApprovals = () => {
 $.get("/delegate/ecom-api/orders/approval?size=2&forApproval=true&status=pen", function (data) {
        console.log(data.orderForApprovalResponse)
        let customerEmail = sessionStorage.getItem('customerEmail');
        if(window.location.href.includes('qa.trimarketplace.com')) {
            customerEmail = 'kevin.kindorf@trimarkusa.com'
        }
        let approvalResponseList = data.orderForApprovalResponse;
        // declare this as a string with valuje of false since hubspot properties need value to be string
        let hasPendingApproval = "false";
        if(approvalResponseList) {
            console.log(approvalResponseList)
            // responselist array is empty always set notify flag to false
            if(approvalResponseList.length === 0) {
                console.log('approval list is empty set notify flag to false')
                $.ajax({
                    url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                    type: 'patch',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        sessionStorage.setItem('triggerPendingApproval', 'false')
                        sessionStorage.setItem('pendingApprovalCount', approvalResponseList.length)
                        hasPendingApproval = "false";
                    },
                    data: JSON.stringify({
                        "properties": {
                            "rhythm_approver_notify": 'false'
                        }
                    })
                });
            }
            else if(approvalResponseList.length > 0) {
                for(var i = 0; i < approvalResponseList.length; i++) {
                    let approval = approvalResponseList[i]
                    if(approval.approveStatus === "Pending"){
                        hasPendingApproval = "true";
                        break;
                    }
                   
                }
                if (hasPendingApproval === 'true') {
                    let customerEmail = sessionStorage.getItem('customerEmail');
                    if(window.location.href.includes('qa.trimarketplace.com')) {
                        customerEmail = 'kevin.kindorf@trimarkusa.com'
                    }
                    $.ajax({
                        url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                        type: 'patch',
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data) {
                            sessionStorage.setItem('triggerPendingApproval', 'true')
                            sessionStorage.setItem('pendingApprovalCount', approvalResponseList.length)
                            hasPendingApproval = "false";
                        },
                        data: JSON.stringify({
                            "properties": {
                                "rhythm_approver_notify": 'true'
                            }
                        })
                    });
                }
            }
            
        }
        
    });
}


const approvalObserver = new MutationObserver(() => {
    let rejectOrderTitle = $(".bbm-modal-title")
    const proceedToReject = $('.bbm-modal-content .btn-wrapper .btn-proceed');

    // reject order after proceed button in reject order modal is clicked
    if (rejectOrderTitle.text() === "Reject Order") {
        $(proceedToReject).unbind().click(function() {
            console.log('approver has rejected order')
            setTimeout(() => {
                checkPendingApprovals();
              }, 500);
            
        })
    }
});

approvalObserver.observe(document.body, { childList: true, subtree: true });



