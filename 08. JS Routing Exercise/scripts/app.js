$(() => {
    const app = Sammy('#main', function () {
        this.use("Handlebars", "hbs");

        this.get('index.html', function () {
            this.redirect('#/home');
        });

        this.get('#/home', function (context) {
            context.loggedIn = sessionStorage.getItem("authtoken");
            context.teamId = sessionStorage.getItem("teamId");
            context.username = sessionStorage.getItem("username");
            context.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });
        });

        this.get('#/register', function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs",
                registerForm: "./templates/register/registerForm.hbs"
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPassword = context.params.repeatPassword;

            if (username !== "" && password !== "" && password === repeatPassword) {
                auth.register(username, password, repeatPassword)
                    .then(function (res) {
                        auth.saveSession(res);
                        auth.showInfo("Successfully registered!");
                        context.redirect('#/home');
                    })
            }
            else {
                auth.showError("Invalid credentials");
                context.redirect('#/register');
            }
        });

        this.get('#/login', function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs",
                loginForm: "./templates/login/loginForm.hbs"
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;

            if (username !== "" && password !== "") {
                auth.login(username, password)
                    .then(function (res) {
                        auth.saveSession(res);
                        auth.showInfo("Successfully login!");
                        context.redirect('#/home');
                    })
            }
            else {
                auth.showError("Invalid credentials");
                context.redirect('#/login');
            }
        });

        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    auth.showInfo("Logout successfully!");
                    context.redirect('#/home');
                }).catch(auth.handleError);
        });

        this.get('#/about', function () {
            this.loggedIn = sessionStorage.getItem("authtoken");
            this.teamId = sessionStorage.getItem("teamId");
            this.username = sessionStorage.getItem("username");
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            });
        });

        this.get('#/catalog', function (context) {
            context.loggedIn = sessionStorage.getItem("authtoken");
            context.teamId = sessionStorage.getItem("teamId");
            context.username = sessionStorage.getItem("username");

            teamsService.loadTeams()
                .then(function (teams) {
                   context.teams = teams;
                    context.loadPartials({
                        header: "./templates/common/header.hbs",
                        footer: "./templates/common/footer.hbs",
                        team: "./templates/catalog/team.hbs"
                    }).then(function () {
                       this.partial('./templates/catalog/teamCatalog.hbs');
                    });
                });
        });
        
        this.get('#/catalog/:id', function (context) {
            context.loggedIn = sessionStorage.getItem("authtoken");
            context.username = sessionStorage.getItem("username");
            let id = context.params.id.slice(1);
            teamsService.loadTeamDetails(id)
                .then(function (res) {
                    context.name = res.name;
                    context.teamId = res._id;
                    context.comment = res.comment;
                    context.isAuthor = sessionStorage.getItem("id") == res._acl.creator;
                    context.loadPartials({
                        header: "./templates/common/header.hbs",
                        footer: "./templates/common/footer.hbs",
                        teamControls: "./templates/catalog/teamControls.hbs"
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs');
                    })
                })
        });
    });

    app.run();
});