$(() => {
    const app = Sammy('#container', function () {
        this.use("Handlebars", "hbs");

        this.get("index.html", function () {
            if (auth.isAuthed()) {
                this.redirect('#/home');
            }
            else {
                this.redirect('#/register');
            }
        });

        this.get('#/register', function () {
            this.loadPartials({
                footer: './templates/common/footer.hbs',
                viewNotLoggedNav: './templates/common/viewNotLoggedNav.hbs'
            }).then(function () {
                this.partial('./templates/registerView.hbs');
            });
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.pass;
            let repeatedPass = context.params.checkPass;
            if (username.length > 4 && password === repeatedPass && password !== "" && repeatedPass !== "") {
                auth.register(username, password)
                    .then(function (res) {
                        auth.saveSession(res);
                        notify.showInfo('Successfully registered!');
                        context.redirect('#/home');
                    }).catch(notify.handleError);
            }
            else {
                notify.showError('Invalid credentials!');
                this.redirect('#/register');
            }
        });

        this.get('#/login', function () {
            this.loadPartials({
                footer: './templates/common/footer.hbs',
                viewNotLoggedNav: './templates/common/viewNotLoggedNav.hbs'
            }).then(function () {
                this.partial('./templates/loginView.hbs');
            });
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.pass;
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
                context.redirect('#/login');
            }
        });

        this.get('#/home', function (context) {
            $.ajax({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/flights?query={"isPublic": "true"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                context.flights = res;
                context.name = sessionStorage.getItem('username');
                context.loadPartials({
                    homeFlight: "./templates/common/homeFlight.hbs",
                    footer: './templates/common/footer.hbs',
                    viewLoggedNav: './templates/common/viewLoggedNav.hbs'
                }).then(function () {
                    context.partials = this.partials;
                    context.partial('./templates/homeView.hbs');
                })
            })
        });

        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    notify.showInfo('Successfully logout!');
                    sessionStorage.clear();
                    context.redirect('#/login');
                }).catch(notify.handleError);
        });

        this.get('#/createFlight', function (context) {
            context.name = sessionStorage.getItem('username');
            context.loadPartials({
                footer: './templates/common/footer.hbs',
                viewLoggedNav: './templates/common/viewLoggedNav.hbs'
            }).then(function () {
                context.partials = this.partials;
                context.partial('./templates/viewAddFlight.hbs');
            });
        });

        this.post('#/createFlight', function (context) {
            let publicTick = context.params.public;
            let object = {
                destination: context.params.destination,
                origin: context.params.origin,
                departureDate: context.params.departureDate,
                departureTime: context.params.departureTime,
                seats: Number(context.params.seats),
                cost: Number(context.params.cost),
                creatorId: sessionStorage.getItem('id'),
                img: context.params.img,
                isPublic: publicTick == 'on' ? "true" : "false"
            };
            if (typeof object.destination == "string" && typeof object.origin == "string" &&
                typeof object.seats == "number" && typeof object.cost == "number" && object.destination != "" &&
                object.origin != "" && object.seats > 0 && object.cost > 0) {
                $.ajax({
                    method: "POST",
                    url: remote.baseUrl + 'appdata/' + remote.appKey + '/flights',
                    data: JSON.stringify(object),
                    headers: {
                        Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken'),
                        "Content-Type": "application/json"
                    },
                }).then(function (res) {
                    console.log(res);
                    notify.showInfo('Created flight!');
                    context.redirect('#/home');
                }).catch(notify.handleError);
            }
            else {
                notify.showError('Invalid credentials!');
                this.redirect('#/createFlight');
            }
        });

        this.get('#/viewDetails:index', function (context) {
            let index = context.params.index.slice(1);
            $.ajax({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/flights?query={"isPublic": "true"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                context.name = sessionStorage.getItem('username');
                context.image = res[index].img;
                context.destination = res[index].destination;
                context.origin = res[index].origin;
                context.departureDate = res[index].departureDate;
                context.departureTime = res[index].departureTime;
                context.seats = res[index].seats;
                context.cost = res[index].cost;
                if (sessionStorage.getItem('id') === res[index].creatorId) {
                    context.index = index;
                    context.isCreator = true;
                }
                context.loadPartials({
                    footer: './templates/common/footer.hbs',
                    viewLoggedNav: './templates/common/viewLoggedNav.hbs'
                }).then(function () {
                    context.partials = this.partials;
                    context.partial('./templates/viewFlightDetails.hbs');
                })
            })
        });

        this.get('#/editFlight:index', function (context) {
            let index = context.params.index.slice(1);
            $.ajax({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/flights?query={"isPublic": "true"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                context.name = sessionStorage.getItem('username');
                context.image = res[index].img;
                context.destination = res[index].destination;
                context.origin = res[index].origin;
                context.departureDate = res[index].departureDate;
                context.departureTime = res[index].departureTime;
                context.seats = res[index].seats;
                context.cost = res[index].cost;
                context.flightId = res[index]._id;
                context.loadPartials({
                    footer: './templates/common/footer.hbs',
                    viewLoggedNav: './templates/common/viewLoggedNav.hbs'
                }).then(function () {
                    context.partials = this.partials;
                    context.partial('./templates/viewEditFlight.hbs');
                })
            });
        });

        this.post('#/editFlight', function (context) {
            let publicTick = context.params.public;
            let object = {
                destination: context.params.destination,
                origin: context.params.origin,
                departureDate: context.params.departureDate,
                departureTime: context.params.departureTime,
                seats: Number(context.params.seats),
                cost: Number(context.params.cost),
                creatorId: sessionStorage.getItem('id'),
                img: context.params.img,
                isPublic: publicTick == 'on' ? "true" : "false"
            };
            let flightId = $("#viewEditFlight").attr('data-flight');
            console.log(flightId);
            $.ajax({
                method: "PUT",
                data: object,
                url: remote.baseUrl + 'appdata/' + remote.appKey + '/flights/' + flightId,
                headers: {Authorization: 'Kinvey ' + sessionStorage.getItem("authtoken")}
            }).then(function () {
                notify.showInfo('Flight edited successfully!');
                context.redirect('#/home');
            }).catch(notify.handleError);

        });

        this.get('#/listFlights', function (context) {
            $.ajax({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/flights?query={"creatorId": "${sessionStorage.getItem('id')}"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                console.log(res);
                context.flights = res;
                context.name = sessionStorage.getItem('username');
                context.loadPartials({
                    footer: './templates/common/footer.hbs',
                    myFlight: './templates/common/myFlight.hbs',
                    viewLoggedNav: './templates/common/viewLoggedNav.hbs'
                }).then(function () {
                    context.partials = this.partials;
                    context.partial('./templates/viewMyFlights.hbs');
                })
            })
        });

        this.get('#/detailsFlight:index', function (context) {
            let index = context.params.index.slice(1);
            $.ajax({
                method: "GET",
                url: `${remote.baseUrl}appdata/${remote.appKey}/flights?query={"creatorId": "${sessionStorage.getItem('id')}"}`,
                headers: {"Authorization": "Kinvey " + sessionStorage.getItem("authtoken")},
            }).then(function (res) {
                context.name = sessionStorage.getItem('username');
                context.image = res[index].img;
                context.destination = res[index].destination;
                context.origin = res[index].origin;
                context.departureDate = res[index].departureDate;
                context.departureTime = res[index].departureTime;
                context.seats = res[index].seats;
                context.cost = res[index].cost;
                if (sessionStorage.getItem('id') === res[index].creatorId) {
                    context.index = index;
                    context.isCreator = true;
                }
                context.loadPartials({
                    footer: './templates/common/footer.hbs',
                    viewLoggedNav: './templates/common/viewLoggedNav.hbs'
                }).then(function () {
                    context.partials = this.partials;
                    context.partial('./templates/viewFlightDetails.hbs');
                });
            })
        })

        this.get('#/deleteFlight:id', function (context) {
           let flightId = context.params.id.slice(1);
            $.ajax({
                method: "DELETE",
                url: remote.baseUrl + 'appdata/' + remote.appKey + '/flights/' + flightId,
                headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken')},
            }).then(function () {
                notify.showInfo("Flight deleted.");
                context.redirect('#/listFlights');
            }).catch(notify.handleError);
        });
    });

    app.run();
});