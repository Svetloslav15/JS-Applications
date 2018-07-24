const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_rJuaknXVX';
const APP_SECRET = 'd1530658d07946cd9fbb36fc043018ad';
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)};
const BOOKS_PER_PAGE = 5;

function loginUser() {
    let username = $('#formLogin').find('input[name="username"]').val();
    let password = $('#formLogin').find('input[name="passwd"]').val();
    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        data: {username, password},
        headers: AUTH_HEADERS
    }).then(function (res) {
        signInUser(res, "Login successful.");
    }).catch(handleAjaxError);
}

function registerUser() {
    let username = $('#formRegister').find('input[name="username"]').val();
    let password = $('#formRegister').find('input[name="passwd"]').val();

    $.ajax({
        method: "POST",
        url: BASE_URL + 'user/' + APP_KEY + '/',
        data: {username, password},
        headers: AUTH_HEADERS
    }).then(function (res) {
        signInUser(res, "Registration successful.");
    }).catch(handleAjaxError);
}

function listBooks() {
    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authToken")}
    }).then(function (res) {
        showView("viewBooks");
        displayPaginationAndBooks(res.reverse());
    }).catch(handleAjaxError);
}


function createBook() {
    let author = $('#formCreateBook').find('input[name="author"]').val();
    let title = $('#formCreateBook').find('input[name="title"]').val();
    let description = $('#formCreateBook').find('textarea').val();
    let authorId = sessionStorage.getItem('userId');

    $.ajax({
        method: "POST",
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authToken")},
        data: {title, author, description, authorId}
    }).then(function () {
        showInfo('Book created.');
    }).catch(handleAjaxError);
}

function deleteBook(book) {
    swal({
        title: "Delete book",
        text: `Are you sure you want to delete that book?`,
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            let id = $($(book).children()[0]).attr('id');

            $.ajax({
                method: "DELETE",
                url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + id,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authToken")},
            }).then(function () {
                showInfo('Book deleted.');
                $(book).remove();
            }).catch(handleAjaxError);
        }
    });
}

function loadBookForEdit(book) {
    showView('viewEditBook');
    let title = $($(book).children()[0]).text();
    let author = $($(book).children()[1]).text();
    let description = $($(book).children()[2]).text();
    let id = $($(book).children()[0]).attr('id');
    $('#formEditBook input[name=id]').val(id);
    $('#formEditBook input[name=title]').val(title);
    $('#formEditBook input[name=author]').val(author);
    $('#formEditBook textarea[name=description]').val(description);
}

function editBook() {
    let id = $('#formEditBook input[name=id]').val();
    let title = $('#formEditBook input[name=title]').val();
    let author = $('#formEditBook input[name=author]').val();
    let description = $('#formEditBook textarea[name=description]').val();
    let authorId = sessionStorage.getItem("userId");

    $.ajax({
        method: "PUT",
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + id,
        data: {title, author, description, authorId},
        headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authToken")},
    }).then(function () {
        showInfo('Book edited.');
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
            sessionStorage.clear();
            showHomeView();
            showHideMenuLinks();
            showInfo('Logout successful.')
        }
    });
}

function signInUser(res, message) {
    sessionStorage.setItem("username", res.username);
    sessionStorage.setItem("authToken", res._kmd.authtoken);
    sessionStorage.setItem("userId", res._id);

    showHomeView();
    showHideMenuLinks();
    showInfo(message);
}

function displayPaginationAndBooks(books) {
    let pagination = $('#pagination-demo')
    if (pagination.data("twbs-pagination")) {
        pagination.twbsPagination('destroy')
    }
    pagination.twbsPagination({
        totalPages: Math.ceil(books.length / BOOKS_PER_PAGE),
        visiblePages: 5,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            $('#books > table').find('tr').each((index, el) => {
                if (index > 0) {
                    $(el).remove();
                }
            });
            let startBook = (page - 1) * BOOKS_PER_PAGE
            let endBook = Math.min(startBook + BOOKS_PER_PAGE, books.length)
            $(`a:contains(${page})`).addClass('active')
            for (let i = startBook; i < endBook; i++) {
                (async function () {
                    let bookTemplate = await $.get('bookTemplate.hbs');
                    let bookTemp = Handlebars.compile(bookTemplate);

                    let info = {
                        title: books[i].title,
                        author: books[i].author,
                        description: books[i].description,
                        bookId: books[i]._id
                    };

                    let bookId = books[i].authorId;
                    let userId = sessionStorage.getItem("userId");
                    if (bookId === userId) {
                        info.id = bookId;
                    }
                    let html = bookTemp(info);
                    $('#books table').append(html);
                }());
            }
        }
    })
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}