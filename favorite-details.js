/* create Mutation Observer */
const config = { childList: true, characterData: false, subtree: true, attributes: true };

const callback = function (mutationsList, observer) {
  updateWarningText();
};

const observer = new MutationObserver(callback);
var targetNode = document.body;
if (targetNode) {
  observer.observe(targetNode, config);
}
/* end Mutation Observer */

/* update warning text */
updateWarningText = () => {
  /* replace "currently not in stock" with "low stock" */
  const warningMessage = $('.message.warning');
  warningMessage.map( (warningDiv, i) => {
     const lowStockDiv = $('.message.warning')[warningDiv];
     if ( $(lowStockDiv).html() == "Currently not in stock" ) {
       $(lowStockDiv).html("Low")
     }
  });

}