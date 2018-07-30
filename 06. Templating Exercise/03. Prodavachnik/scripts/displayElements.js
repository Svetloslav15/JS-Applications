function showView(view) {
    $('main > section').hide();
    $('#' + view).show();
}

function showLoginView() {
    showView('viewLogin');
}

function showHomeView() {
    showView("viewHome");
}

function showRegisterView() {
    showView('viewRegister');
}
function showListView() {
    listAds();
}

function showCreateView() {
    showView('viewCreateAd');
}
function showLoggedNav() {
    $('#linkHome').show();
    $('#linkLogin').hide();
    $('#linkRegister').hide();
    $('#linkListAds').show();
    $('#linkCreateAd').show();
    $('#linkLogout').show();
}

function showNotLoggedNav() {
    $('#linkHome').show();
    $('#linkLogin').show();
    $('#linkRegister').show();
    $('#linkListAds').hide();
    $('#linkCreateAd').hide();
    $('#linkLogout').hide();
}

function showInfo(message) {
    let infoBox = $('#infoBox');
    infoBox.text(message);
    infoBox.fadeIn();
    setTimeout(function() {
        $('#infoBox').fadeOut("slow")
    }, 3000);
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.text(errorMsg);
    errorBox.fadeIn();
    setTimeout(function() {
        $('#errorBox').fadeOut("slow")
    }, 3000);
}