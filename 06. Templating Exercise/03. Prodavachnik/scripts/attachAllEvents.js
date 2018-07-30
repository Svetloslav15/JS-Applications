function attachAllEvents() {
    $('#linkHome').on("click", showHomeView);
    $('#linkLogin').on("click", showLoginView);
    $('#linkRegister').on("click",showRegisterView);
    $('#linkListAds').on("click", showListView);
    $('#linkCreateAd').on("click", showCreateView);

    $('#buttonCreateAd').on("click", createAd);
    $('#buttonEditAd').on("click", editAd);
    $('#buttonRegisterUser').on("click", registerUser);
    $('#buttonLoginUser').on("click", loginUser);
    $('#linkLogout').on("click", logoutUser);

    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });
}