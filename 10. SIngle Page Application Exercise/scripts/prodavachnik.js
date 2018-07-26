function startApp() {
    if (getCookie("userId")){
        showLoggedNav();
        $('#loggedInUser').text(`Welcome ${getCookie("username")}!`);
    }
    else{
        showNotLoggedNav();
    }
    showView('viewHome');
    attachAllEvents();
}