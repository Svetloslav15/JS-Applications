$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', "hbs");

        //Main file
        this.get('index.html', function (context) {
            if (auth.isAuthed()) {
                context.redirect('#/home');
            }
            else {
                context.redirect('#/welcome');
            }
        });

        //Welcome Page
        this.get('#/welcome', function () {
            this.loadPartials({
                footer: './templates/footer.hbs'
            }).then(function () {
                this.partial('./templates/welcome.hbs');
            }).catch(notify.handleError);
        });

        //Register
        this.post('#/register', function (context) {
            let username = context.params["username-register"];
            let password = context.params["password-register"];
            let checkedPass = context.params["password-register-check"];
            if (username.length >= 5 && password !== "" &&
                checkedPass !== "" && password == checkedPass) {
                auth.register(username, password)
                    .then(function (res) {
                        console.log(res);
                        auth.saveSession(res);
                        notify.showInfo('Successfully registered!');
                        context.redirect('#/home');
                    }).catch(notify.handleError);
            }
            else {
                notify.showError('Invalid credentials, please try again!');
                this.redirect('#/register');
            }
        });

        //Login
        this.post('#/login', function (context) {
            let username = context.params["username-login"];
            let password = context.params["password-login"];
            if (username !== "" && password !== "") {
                auth.login(username, password)
                    .then(function (res) {
                        auth.saveSession(res);
                        notify.showInfo('Successfully login!');
                        context.redirect('#/home');
                    }).catch(notify.handleError)
            }
            else {
                notify.showError("Invalid credentials");
            }
        });

        //Home Page
        this.get('#/home', function (context) {
            $.get({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/receipts?query={"active":"true"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (resFirst) {
                let receiptid = resFirst[0]._id;
                $.ajax({
                    method: "GET",
                    url: `${remote.baseUrl}appdata/${remote.appKey}/entries?query={"receiptId":"${receiptid}"}`,
                    headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
                }).then(function (res) {
                    let totalSumCurrent = 0;
                    for (let item of res) {
                        totalSumCurrent += Number(item.total);
                    }
                    context.totalP = totalSumCurrent;
                    context.username = sessionStorage.getItem("username");
                    context.products = res;
                    context.productsCount = res.length;
                    context._id = receiptid;
                    context.loadPartials({
                        footer: "./templates/footer.hbs",
                        navigation: "./templates/navigation.hbs",
                        receiptRow: './templates/createReceiptRow.hbs'
                    }).then(function () {
                        this.partial('./templates/createReceipt.hbs');
                    });
                })
            }).catch(notify.handleError)
        });

        //Logout
        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    context.redirect('#/welcome');
                    notify.showInfo('Successfully logout!');
                }).catch(notify.handleError);
        });

        //Delete Entry
        this.get('#/delete:id', function (context) {
            let entryId = context.params.id.slice(1);
            $.ajax({
                method: "DELETE",
                url: remote.baseUrl + 'appdata/' + remote.appKey + '/entries/' + entryId,
                headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken')},
            }).then(function () {
                let currentAllSum = 0;
                let subtotals = $('.totalSumProduct');
                for (let item of subtotals) {
                    currentAllSum += $(item).text();
                }
                console.log(currentAllSum);
                notify.showInfo("Entry removed");
                context.redirect('#/home');
            }).catch(notify.handleError);
        });

        //Create Entry
        this.post('#/createEntry', function (context) {
            let object = {
                type: context.params.type,
                quantity: context.params.qty,
                pricePerUnit: context.params.price,
                receiptId: context.params.receiptId
            };
            if (object.type !== "" && object.quantity !== "" && object.pricePerUnit !== "") {
                object.total = object.quantity * object.pricePerUnit;
                $.ajax({
                    method: "POST",
                    url: remote.baseUrl + 'appdata/' + remote.appKey + '/entries',
                    data: JSON.stringify(object),
                    headers: {
                        Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken'),
                        "Content-Type": "application/json"
                    },
                }).then(function () {
                    let totalSumCurrent = object.total;
                    let divs = $('.totalSumProduct');
                    for (let div of divs) {
                        totalSumCurrent += Number($(div).text());
                    }
                    context.redirect('#/home', totalSumCurrent);
                    $('#totalSum').text(totalSumCurrent);
                    notify.showInfo('Created entry!');
                }).catch(notify.handleError);
            }
            else {
                notify.showError("Invalid credentials!");
            }
        });

        //Overview
        this.get('#/allReceipts', function (context) {
            $.get({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/receipts?query={"_acl.creator":"${sessionStorage.getItem("id")}","active":"false"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                let receiptSumAll = 0;
                for (let receipt of res) {
                    receiptSumAll += Number(receipt.total);
                }
                context.receiptSumAll = receiptSumAll;
                context.receipts = res;
                context.loadPartials({
                    footer: './templates/footer.hbs',
                    navigation: "./templates/navigation.hbs",
                    receipt: "./templates/allReceipts-receipt.hbs"
                }).then(function () {
                    this.partial('./templates/allReceipts.hbs');
                });
            })
        });

        //Checkout
        this.post('#/checkout', function (context) {
            let id = context.params.receiptId;
            let productsCount = context.params.productsCount;
            console.log(productsCount);
            let total = context.params.total;
            $.get({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/receipts/${id}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                res.active = "false";
                res.productsCount = productsCount;
                res.total = total;
                $.get({
                    method: "PUT",
                    data: JSON.stringify(res),
                    url: `${remote.baseUrl}appdata/${remote.appKey}/receipts/${id}`,
                    headers: {
                        "Authorization": "Kinvey " + sessionStorage.getItem("authtoken"),
                        "Content-Type": "application/json"
                    },
                }).then(function () {
                    let obj = {
                        active: "true",
                        productsCount: 0,
                        total: 0,
                        creatorId: sessionStorage.getItem("id"),
                        creationDate: getToday()
                    };
                    $.ajax({
                        method: "POST",
                        data: JSON.stringify(obj),
                        url: `${remote.baseUrl}appdata/${remote.appKey}/receipts`,
                        headers: {
                            "Authorization": "Kinvey " + sessionStorage.getItem("authtoken"),
                            "Content-Type": "application/json"
                        }
                    }).then(function () {
                        notify.showInfo('Receipt checked out!');
                        context.redirect('#/home');
                    });
                });
            });
        });

        //Receipt Details
        this.get('#/details:index', function (context) {
            let index = context.params.index.slice(1);
            $.get({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/receipts?query={"_acl.creator":"${sessionStorage.getItem("id")}","active":"false"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                let receiptId = res[index]._id;
                $.ajax({
                    method: "GET",
                    url: `${remote.baseUrl}appdata/${remote.appKey}/entries?query={"receiptId":"${receiptId}"}`,
                    headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
                }).then(function (innerRes) {
                    context.productsDetails = innerRes;
                    context.loadPartials({
                        footer: './templates/footer.hbs',
                        navigation: "./templates/navigation.hbs",
                        productDetails: './templates/productDetails.hbs'
                    }).then(function () {
                        this.partial('./templates/receiptDetails.hbs');
                    });
                })
            })
        });
    });
    app.run();
});

function getToday() {
    let today = new Date();
    let date = +today.getDate() >= 10 ? +today.getDate() : "0" + +today.getDate();
    let month = today.getMonth() + 1 >= 10 ? today.getMonth() + 1 : "0" + (today.getMonth() + 1);
    let hours = today.getHours() >= 10 ? today.getHours() : "0" + today.getHours();
    let minutes = today.getHours() >= 10 ? today.getHours() : "0" + today.getHours();
    return `${today.getFullYear()}-${month}-${date} ${hours}:${minutes}`;
}