$(() => {
    const app = Sammy("#container", function () {
        this.use("Handlebars", "hbs");

        this.get("index.html", function () {
            if (auth.isAuthed()) {
                this.redirect('#/home');
            }
            else {
                this.redirect('#/welcome');
            }
        });

        this.get('#/welcome', function () {
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/welcome.hbs');
            });
        });

        this.get('#/register', function () {
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/register.hbs');
            });
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPass = context.params.repeatPass;

            if (username.length < 3) {
                notify.showError("Username must be at least 3 symbols!");
            }
            else if (password.length < 6) {
                notify.showError("Password must be at least 6 symbols!");
            }
            else if (password != repeatPass) {
                notify.showError("Passwords not match!");
            }
            else {
                auth.register(username, password)
                    .then(function (data) {
                        auth.saveSession(data);
                        notify.showInfo("Register successfully!");
                        context.redirect('#/home');
                    }).catch(notify.handleError);
            }
        });

        this.get('#/login', function () {
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/loginPage.hbs');
            });
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;

            if (username.length < 3) {
                notify.showError("Username must be at least 3 symbols!");
            }
            else if (password.length < 6) {
                notify.showError("Password must be at least 6 symbols!");
            }
            else {
                auth.login(username, password)
                    .then(function (data) {
                        auth.saveSession(data);
                        notify.showInfo("Login successfully!");
                        context.redirect('#/home');
                    }).catch(notify.handleError);
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

        this.get('#/home', function (context) {
            if (!auth.isAuthed()) {
                this.redirect('#/welcome');
                return;
            }
            context.isAuth = auth.isAuthed();
            context.user = sessionStorage.getItem("username");
            service.getAllCars()
                .then(function (cars) {
                    cars.forEach((el, i) => {
                        el.isAuthor = sessionStorage.getItem("username") == el.seller ? true : false;
                    });
                    context.cars = cars;
                    context.loadPartials({
                        navigation: "./templates/common/navigation.hbs",
                        footer: "./templates/common/footer.hbs",
                        car: "./templates/common/allListingPage-car.hbs"
                    }).then(function () {
                        this.partial('./templates/listingAllCarsView.hbs');
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.get('#/createCar', function (context) {
            context.isAuth = auth.isAuthed();
            context.user = sessionStorage.getItem("username");
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/createCar.hbs');
            }).catch(notify.handleError);
        });

        this.post('#/createCar', function (context) {
            let data = {
                title: context.params.title,
                brand: context.params.brand,
                description: context.params.description,
                fuel: context.params.fuelType,
                imageUrl: context.params.imageUrl,
                isAuthor: true,
                model: context.params.model,
                price: context.params.price,
                seller: sessionStorage.getItem("username"),
                title: context.params.title,
                year: context.params.year,
            };
            if (data.title > 33) {
                notify.showError("Title must be at least 33 symbols!");
            }
            else if (data.description.length < 30 || data.description > 450) {
                notify.showError("Invalid description field!");
            }
            else if (data.model.length > 11) {
                notify.showError("Model must be not more than 11 symbols.");
            }
            else if (data.model.length < 4) {
                notify.showError("Model must be at least 4 symbols.");
            }
            else if (data.brand.length > 11) {
                notify.showError("Brand must be not more than 11 symbols.");
            }
            else if (data.fuel.length > 11) {
                notify.showError("FuelType must be not more than 11 symbols.");
            }
            else if (data.year.length !== 4) {
                notify.showError("Year must be valid!");
            }
            else if (Number(data.price) > 1000000) {
                notify.showError("Price must be lower than 1000000!");
            }
            else if (!data.imageUrl.startsWith("http")) {
                notify.showError("Url must starts with HTTP!");
            }
            else if (data.title == "" || data.brand == "" || data.description == "" ||
                data.fuel == "" || data.imageUrl == "" || data.model == "" || data.price == "" ||
                data.year == "") {
                notify.showError("Empty field!");
            }
            else {
                service.createCar(data)
                    .then(function () {
                        notify.showInfo("Car Listing Created!");
                        context.redirect("#/home");
                    }).catch(notify.handleError);
            }
        });

        this.get('#/deleteCar/:id', function (context) {
            let id = context.params.id;
            service.deleteCarById(id)
                .then(function () {
                    notify.showInfo("Car deleted!");
                    context.redirect('#/home');
                }).catch(notify.handleError);
        });

        this.get('#/myListings', function (context) {
            context.isAuth = auth.isAuthed();
            context.user = sessionStorage.getItem("username");
            service.getMyCars()
                .then(function (res) {
                    context.cars = res;
                    context.loadPartials({
                        navigation: "./templates/common/navigation.hbs",
                        footer: "./templates/common/footer.hbs",
                        car: "./templates/common/myCars-car.hbs"
                    }).then(function () {
                        this.partial('./templates/myCarsPage.hbs');
                    })
                }).catch(notify.handleError);
        });

        this.get('#/details/:id', function (context) {
            context.isAuth = auth.isAuthed();
            context.user = sessionStorage.getItem("username");
            let id = context.params.id;
            service.getCarById(id)
                .then(function (data) {
                    data.isAuthor = sessionStorage.getItem("username") == data.seller ? true : false;
                    context.car = data;
                    context.loadPartials({
                        navigation: "./templates/common/navigation.hbs",
                        footer: "./templates/common/footer.hbs",
                    }).then(function () {
                        this.partial('./templates/carDetails.hbs');
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.get('#/editCar/:id', function (context) {
            let id = context.params.id;
            context.isAuth = auth.isAuthed();
            context.user = sessionStorage.getItem("username");
            service.getCarById(id)
                .then(function (data) {
                    data.isAuthor = sessionStorage.getItem("username") == data.seller ? true : false;
                    context.car = data;
                    console.log(data);
                    context.loadPartials({
                        navigation: "./templates/common/navigation.hbs",
                        footer: "./templates/common/footer.hbs"
                    }).then(function () {
                        this.partial('./templates/editCar.hbs');
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        })

        this.post('#/editCar/:id', function (context) {
            let id = context.params.id;
            let data = {
                title: context.params.title,
                brand: context.params.brand,
                description: context.params.description,
                fuel: context.params.fuelType,
                imageUrl: context.params.imageUrl,
                isAuthor: true,
                model: context.params.model,
                price: context.params.price,
                seller: sessionStorage.getItem("username"),
                title: context.params.title,
                year: context.params.year,
            };
            console.log(data);
            if (data.title > 33) {
                notify.showError("Title must be at least 33 symbols!");
            }
            else if (data.description.length < 30 || data.description > 450) {
                notify.showError("Invalid description field!");
            }
            else if (data.model.length > 11) {
                notify.showError("Model must be not more than 11 symbols.");
            }
            else if (data.model.length < 4) {
                notify.showError("Model must be at least 4 symbols.");
            }
            else if (data.brand.length > 11) {
                notify.showError("Brand must be not more than 11 symbols.");
            }
            else if (data.fuel.length > 11) {
                notify.showError("FuelType must be not more than 11 symbols.");
            }
            else if (data.year.length !== 4) {
                notify.showError("Year must be valid!");
            }
            else if (Number(data.price) > 1000000) {
                notify.showError("Price must be lower than 1000000!");
            }
            else if (!data.imageUrl.startsWith("http")) {
                notify.showError("Url must starts with HTTP!");
            }
            else if (data.title == "" || data.brand == "" || data.description == "" ||
                data.fuel == "" || data.imageUrl == "" || data.model == "" || data.price == "" ||
                data.year == "") {
                notify.showError("Empty field!");
            }
            else {
                service.editCar(data, id)
                    .then(function () {
                        notify.showInfo("Car Listing Edited!");
                        context.redirect("#/home");
                    }).catch(notify.handleError);
            }
        });
    });

    app.run();
});