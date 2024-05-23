$(window).on('load', function () {
    // sometimes take a few seconds for statuses to load in DOM
    // TODO: find better way to handle this
    setTimeout(setStatusColor, 0);
    //setTimeout(setStatusColor, 1000 );
    //setTimeout(setStatusColor, 2000 );
});

addEventListener("DOMNodeInserted", (event) => {
    setStatusColor();
});

setStatusColor = () => {
    $('.order-list-order-status').each(function (index, item) {
        if (item.innerText === "Approved") {
            item.style.color = "#198E56"; //TM Green
        } else if (item.innerText === "Pending") {
            item.style.color = "#C9AA10";
        } else if (item.innerText === "Rejected") {
            item.style.color = "#C03326";
        }
    });
}