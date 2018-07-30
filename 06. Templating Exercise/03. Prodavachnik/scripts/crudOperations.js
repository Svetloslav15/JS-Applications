const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_HJGJJ0BVQ';
const APP_SECRET = '16232114504b4938bb7db43d8a5b4231';
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)};


function loginUser() {
    let username = $('#formLogin').find('input[name=username]').val();
    let password = $('#formLogin').find('input[name=passwd]').val();
    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        data: {username, password},
        headers: AUTH_HEADERS
    }).then(function (res) {
        signInUser(res);
        showView('viewHome');
        showInfo("Login successful!");
        showLoggedNav();
        $('#loggedInUser').text(`Welcome ${username}!`);
    }).catch(handleAjaxError);
}

function registerUser() {
    let username = $('#formRegister').find('input[name=username]').val();
    let password = $('#formRegister').find('input[name=passwd]').val();
    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/',
        data: {username, password},
        headers: AUTH_HEADERS
    }).then(function (res) {
        signInUser(res);
        showView('viewHome');
        showInfo("Registration successful!");
        $('#loggedInUser').text(`Welcome ${username}!`);
        showLoggedNav();
    }).catch(handleAjaxError);
}

function logoutUser() {
    swal({
        title: "Logout",
        text: `Are you sure that you want to logout?`,
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                method: "POST",
                url: BASE_URL + 'user/' + APP_KEY + '/_logout',
                headers: {Authorization: 'Kinvey ' + getCookie('authToken')}
            }).then(function () {
                showNotLoggedNav();
                deleteCookies();
                showView('viewHome');
                showInfo("Logout successfully!");
                $('#loggedInUser').text("");
            }).catch(handleAjaxError);
        }
    });
}

function createAd() {
    let title = $('#formCreateAd').find('input[name=title]').val();
    let description = $('#formCreateAd').find('textarea[name=description]').val();
    let price = $('#formCreateAd').find('input[name=price]').val();
    let creatorId = getCookie("userId");
    let publisher = getCookie("username");
    let dateOfPublishing = getTodaysDay();
    $.ajax({
        method: "POST",
        url: BASE_URL + 'appdata/' + APP_KEY + '/adverts',
        headers: {Authorization: 'Kinvey ' + getCookie('authToken')},
        data: {title, description, price, creatorId, publisher, dateOfPublishing}
    }).then(function () {
        showInfo("Advert was successfully created!");
        $('#formCreateAd').find('input[name=title]').val("");
        $('#formCreateAd').find('textarea[name=description]').val("");
        $('#formCreateAd').find('input[name=price]').val("");
    }).catch(handleAjaxError);
}

function getTodaysDay() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

async function listAds() {
    await $.ajax({
        method: "GET",
        url: BASE_URL + 'appdata/' + APP_KEY + '/adverts',
        headers: {Authorization: 'Kinvey ' + getCookie('authToken')},
    }).then(function (res) {
        let currentUserId = getCookie("userId");
        for (let advert of res) {
            (async function () {
                $('#ads').find('table').empty();
                $('table').append('<tr>\n' +
                    '<th>Title</th>\n' +
                    '<th>Publisher</th>\n' +
                    '<th>Description</th>\n' +
                    '<th>Price</th>\n' +
                    '<th>Date Published</th>\n' +
                    '<th>Actions</th>\n' +
                    '</tr>')
                let source = await $.get('advertTemplate.hbs');
                let template = Handlebars.compile(source);
                let context = {
                    title: advert.title,
                    description: advert.description,
                    publisher: advert.publisher,
                    dateOfPublishing: advert.dateOfPublishing,
                    price: advert.price,
                    authorId: advert.creatorId,
                    advertId: advert._id
                };
                if (currentUserId === advert.creatorId) {
                    context.userId = "1";
                }
                let html = template(context);
                $('#ads').find('table').append(html);
            }());
        }
    }).catch(handleAjaxError);
    showView('viewAds');
}

function loadAdvertToEdit(advert) {
    let title = $($(advert).children()[0]).text();
    let description = $($(advert).children()[2]).text();
    let price = $($(advert).children()[3]).text();
    let advertId = $(advert).attr('data-advertId');

    $('#formEditAd').find('input[name=id]').val(advertId);
    $('#formEditAd').find('input[name=title]').val(title);
    $('#formEditAd').find('textarea[name=description]').val(description);
    $('#formEditAd').find('input[name=price]').val(price);
    showView('viewEditAd');
}

function editAd() {
    let title = $('#formEditAd').find('input[name=title]').val();
    let description = $('#formEditAd').find('textarea[name=description]').val();
    let price = $('#formEditAd').find('input[name=price]').val();
    let dateOfPublishing = getTodaysDay();
    let publisher = getCookie("username");
    let advertId = $('#formEditAd').find('input[name=id]').val();
    let creatorId = getCookie("userId");
    $.ajax({
        method: "PUT",
        data: {title, description, publisher, price, dateOfPublishing, creatorId},
        url: BASE_URL + 'appdata/' + APP_KEY + '/adverts/' + advertId,
        headers: {Authorization: 'Kinvey ' + getCookie('authToken')}
    }).then(function () {
        showListView();
        showInfo('Advert was edited successfully!');
    }).catch(handleAjaxError);
}

function deleteAd(advert) {
    swal({
        title: "Delete advert",
        text: `Are you sure you want to delete that advert?`,
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            let advertId = $(advert).attr('data-advertId');
            $.ajax({
                method: "DELETE",
                url: BASE_URL + 'appdata/' + APP_KEY + '/adverts/' + advertId,
                headers: {Authorization: 'Kinvey ' + getCookie('authToken')},
            }).then(function () {
                showInfo("Book deleted succesfully!");
                $(advert).fadeOut(2000);
                $(advert).remove();
            }).catch(handleAjaxError);
        }
    });
}

function signInUser(res) {
    setCookie("username", res.username, 10);
    setCookie("authToken", res._kmd.authtoken, 10);
    setCookie("userId", res._id, 10);
}

function readMore(advertId) {
    $.ajax({
        method: "GET",
        url: `${BASE_URL}appdata/${APP_KEY}/adverts/${advertId}`,
        headers: {Authorization: 'Kinvey ' + getCookie('authToken')},
    }).then(function (res) {
        let dateOfPublishing = res.dateOfPublishing;
        let description = res.description;
        let price = res.price;
        let publisher = res.publisher;
        let title = res.title;
        let creatorId = res.creatorId;
        $('#advertTitle').text(title);
        $('#advertDescription').text(description);
        $('#advertPublisher').text(publisher);
        $('#advertDate').text(dateOfPublishing);
        showView("readMore");
    }).catch(handleAjaxError);
}

function setCookie(name, value, days) {
    let day = new Date();
    day.setTime(day.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + day.toGMTString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookies() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError("Invalid data!");
}