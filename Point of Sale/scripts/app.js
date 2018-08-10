$(() => {
    const app = Sammy("#container", function () {
        this.use("Handlebars", "hbs");

        this.get("index.html", function () {
           if (auth.isAuthed()){
               this.redirect("#/home");
           }
           else{
               this.redirect("#/welcome");
           }
        });

        this.get("#/welcome", function () {
            this.loadPartials({
                footer: "./templates/footer.hbs",
            }).then(function () {
                this.partial("./templates/register-login.hbs");
            });
        });

        this.post('#/register', function (context) {
            let username = context.params["username-register"];
            let password = context.params["password-register"];
            let repeatPass = context.params["password-register-check"];
            if (username.length >= 3 && password === repeatPass &&
                username.match(/^[a-zA-Z]+$/) && password.length >= 6 &&
                password.match(/^[a-zA-Z0-9]+$/)) {
                auth.register(username, password)
                    .then(function (res) {
                        auth.saveSession(res);
                        context.redirect('#/home');
                        notify.showInfo("Successfully registered!");
                    }).catch(notify.handleError);
            }
            else {
                notify.showError("Invalid credentials!");
            }
        });

        this.post('#/login', function (context) {
            let username = context.params["username-login"];
            let password = context.params["password-login"];
            if (username.length >= 3 && username.match(/^[a-zA-Z]+$/) && password.length >= 6 &&
                password.match(/^[a-zA-Z0-9]+$/)) {
                auth.login(username, password)
                    .then(function (data) {
                        auth.saveSession(data);
                        notify.showInfo("Successfully login!");
                        context.redirect('#/home');
                    }).catch(notify.handleError);
            }
            else {
                notify.showError("Invalid credentials!");
            }
        });

        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    notify.showInfo("Logout successfully!");
                    context.redirect('#/welcome');
                }).catch(notify.handleError);
        });
        
        this.get("#/home", function (context) {
            context.username = sessionStorage.getItem("username");
            service.getActiveReceipt()
                .then(function (data) {
                    if (data.length === 0){
                        service.createReceipt()
                            .then(function (data) {
                                console.log(data);
                                context.receiptId = data._id;
                                service.getEntriesByReceiptId(data._id)
                                    .then(function (res) {
                                        let currentTotal = 0;
                                        for (let key of res) {
                                            currentTotal += Number(key.total);
                                        }
                                        context.totalP = currentTotal;
                                        context.productCount = res.length;
                                        context.entries = res;
                                        context.loadPartials({
                                            header: "./templates/header.hbs",
                                            footer: "./templates/footer.hbs",
                                            entry: "./templates/homeProductView.hbs"
                                        }).then(function () {
                                            this.partial("./templates/homeView.hbs");
                                        })
                                    }).catch(notify.handleError);
                            }).catch(notify.handleError);
                    }
                    else{
                        context.receiptId = data[0]._id;
                        context.productCount = data[0].productCount;
                        service.getEntriesByReceiptId(data[0]._id)
                            .then(function (res) {
                                context.entries = res;
                                let currentTotal = 0;
                                for (let key of res) {
                                    currentTotal += Number(key.total);
                                }
                                context.totalP = currentTotal;
                                context.productCount = res.length;
                                context.loadPartials({
                                    header: "./templates/header.hbs",
                                    footer: "./templates/footer.hbs",
                                    entry: "./templates/homeProductView.hbs"
                                }).then(function () {
                                    this.partial("./templates/homeView.hbs");
                                })
                            }).catch(notify.handleError);
                    }
                }).catch(notify.handleError);
        });

        this.post("#/createEntry/:id", function (context) {
            let receiptId = context.params.id.slice(1);
            let quantity = context.params.qty;
            let type = context.params.type;
            let pricePerUnit = context.params.price;
            let total = quantity * pricePerUnit;
            service.createEntry({receiptId, quantity, type, pricePerUnit, total})
                .then(function () {
                    notify.showInfo("Product added successfully!");
                    context.redirect("#/home");
                })
        });

        this.get('#/deleteEntry/:id', function (context) {
            let id = context.params.id.slice(1);
            service.deleteEntryById(id)
                .then(function () {
                    notify.showInfo("Entry deleted successfully!");
                    context.redirect("#/home");
                }).catch(notify.handleError);
        });

        this.post("#/checkout", function (context) {
            let id = context.params.receiptId;
            if (context.params.productCount > 0) {
                let data = {
                    active: "false",
                    productsCount: context.params.productCount,
                    total: context.params.total,
                    creatorId: sessionStorage.getItem("id"),
                    creationDate: getToday()
                };
                service.checkoutReceipt(id, data)
                    .then(function () {
                        notify.showInfo("Receipt checked out");
                        service.createReceipt()
                            .then(function () {
                                context.redirect("#/home");
                            }).catch(notify.handleError);
                    }).catch(notify.handleError);
            }
            else{
                notify.showError("You can't checkout empty receipt!");
            }
        });

        this.get('#/overview', function (context) {
            service.getMyReceipts()
                .then(function (data) {
                    context.receipts = data;
                    console.log(data);
                    let allTotal = 0;
                    for (let obj of data) {
                        allTotal += Number(obj.total);
                    }
                    context.allTotal = allTotal;
                    context.loadPartials({
                        header: "./templates/header.hbs",
                        footer: "./templates/footer.hbs",
                        receipt: "./templates/allReceiptsReceipt.hbs"
                    }).then(function () {
                        this.partial('./templates/allReceipts.hbs')
                    })
                }).catch(notify.handleError);
        });

        this.get('#/details/:id', function (context) {
            let id = context.params.id.slice(1);
            service.getReceiptEntries(id)
                .then(function (res) {
                    context.entries = res;
                    context.loadPartials({
                        header: "./templates/header.hbs",
                        footer: "./templates/footer.hbs",
                        entry: "./templates/detailsProduct.hbs"
                    }).then(function () {
                        this.partial("./templates/details.hbs")
                    }).catch(notify.handleError);
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