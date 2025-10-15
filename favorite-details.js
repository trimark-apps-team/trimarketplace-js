// ===========================================================
// TriMark Marketplace - Low Stock Warning Update (Window Scoped)
// ===========================================================

// Make updateWarningText globally accessible
window.updateWarningText = function() {
  // Replace "Currently not in stock" with "Low"
  const warningMessages = $('.message.warning');
  warningMessages.each(function(index, warningDiv) {
      if ($(warningDiv).html().trim() === "Currently not in stock") {
          $(warningDiv).html("Low");
      }
  });
};

// ===========================================================
// Mutation Observer to watch for warning messages
// ===========================================================
window.lowStockConfig = { childList: true, characterData: false, subtree: true, attributes: true };

window.lowStockCallback = function(mutationsList, observer) {
  window.updateWarningText();
};

window.lowStockObserver = new MutationObserver(window.lowStockCallback);

window.lowStockTarget = document.body;
if (window.lowStockTarget) {
  window.lowStockObserver.observe(window.lowStockTarget, window.lowStockConfig);
}

// Run once on initial load
window.updateWarningText();
