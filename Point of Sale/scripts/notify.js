let notify = (() => {
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.find("span").text(message);
        infoBox.fadeIn();
        setTimeout(function() {
            $('#infoBox').fadeOut()
        }, 3000);
    }

    function showError(errorMsg) {
        let errorBox = $('#errorBox');
        errorBox.find("span").text(errorMsg);
        errorBox.fadeIn();
        setTimeout(function () {
            $('#errorBox').fadeOut()
        }, 3000);
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    return{showError, showInfo, handleError}
})();