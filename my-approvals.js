// ===========================================================
// TriMark Marketplace - Pending Approvals & Status Colors
// ===========================================================

// ----------------------
// Set status color
// ----------------------
window.setStatusColor = function () {
    $('.status-value').each(function (index, item) {
        if (item.innerText === "Approved") {
            item.style.color = "#198E56"; // TM Green
        } else if (item.innerText === "Pending") {
            item.style.color = "#C9AA10"; // Yellow
        } else if (item.innerText === "Rejected") {
            item.style.color = "#C03326"; // Red
        }
    });
};

// ----------------------
// Check pending approvals
// ----------------------
window.checkPendingApprovals = function () {
    $.get("/delegate/ecom-api/orders/approval?size=2&forApproval=true&status=pen", function (data) {
        const customerEmailOrig = sessionStorage.getItem('customerEmail');
        const customerEmail = window.location.href.includes('qa.trimarketplace.com')
            ? 'kevin.kindorf@trimarkusa.com'
            : customerEmailOrig;

        const approvalResponseList = data.orderForApprovalResponse;
        let hasPendingApproval = "false";

        if (approvalResponseList) {
            if (approvalResponseList.length === 0) {
                // No pending approvals
                $.ajax({
                    url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                    type: 'PATCH',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({ "properties": { "rhythm_approver_notify": 'false' } }),
                    success: function () {
                        sessionStorage.setItem('triggerPendingApproval', 'false');
                        sessionStorage.setItem('pendingApprovalCount', 'none');
                        hasPendingApproval = "false";
                    }
                });
            } else {
                // One or more approvals
                for (let i = 0; i < approvalResponseList.length; i++) {
                    if (approvalResponseList[i].approveStatus === "Pending") {
                        hasPendingApproval = "true";
                        break;
                    }
                }

                if (hasPendingApproval === "true") {
                    $.ajax({
                        url: `https://eba-rhythm.trimarketplace.com/abandon-cart?email=${customerEmail}`,
                        type: 'PATCH',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({ "properties": { "rhythm_approver_notify": 'true' } }),
                        success: function () {
                            sessionStorage.setItem('triggerPendingApproval', 'true');
                            sessionStorage.setItem('pendingApprovalCount', approvalResponseList.length === 1 ? 'last' : approvalResponseList.length);
                            hasPendingApproval = "false";
                        }
                    });
                }
            }
        }
    });
};

// ----------------------
// MutationObserver for Reject Order modal
// ----------------------
window.approvalObserver = new MutationObserver(() => {
    const rejectOrderTitle = $(".bbm-modal-title");
    const proceedToReject = $('.bbm-modal-content .btn-wrapper .btn-proceed');

    if (rejectOrderTitle.text() === "Reject Order") {
        $(proceedToReject).unbind().click(function () {
            console.log('approver has rejected order');
            setTimeout(() => {
                window.checkPendingApprovals();
            }, 500);
        });
    }
});

window.approvalObserver.observe(document.body, { childList: true, subtree: true });

// ----------------------
// Initialize on window load
// ----------------------
$(window).on('load', function () {
    // Clear session storage initially
    sessionStorage.removeItem('has_pending_approval');
    sessionStorage.removeItem('triggerPendingApproval');
    sessionStorage.removeItem('pendingApprovalCount');

    setTimeout(window.setStatusColor, 0);

    // Check pending approvals on page load
    window.checkPendingApprovals();
});

// ----------------------
// DOMNodeInserted fallback to update status colors
// ----------------------
window.addEventListener("DOMNodeInserted", () => {
    window.setStatusColor();
});
