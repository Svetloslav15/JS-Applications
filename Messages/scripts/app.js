function startApp() {
    const app = Sammy("#app", function () {
        this.use("Handlebars", "hbs");

        this.get("messages.html", function () {
            if (auth.isAuthed()) {
                this.redirect("#/homeLogged");
            }
            else {
                this.redirect("#/homeNotLogged");
            }
        });

        this.get("#/homeNotLogged", function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial("./templates/homeNotLogged.hbs");
            }).catch(notify.handleError);
        });

        this.get('#/register', function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial("./templates/register.hbs");
            }).catch(notify.handleError);
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let name = context.params.name;
            auth.register(username, password, name)
                .then(function (data) {
                    auth.saveSession(data);
                    notify.showInfo("Register successful!");
                    context.redirect('#/homeLogged');
                }).catch(notify.handleError);
        });

        this.get('#/login', function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial("./templates/loginView.hbs");
            }).catch(notify.handleError);
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            console.log(context.params);
            auth.login(username, password)
                .then(function (data) {
                    auth.saveSession(data);
                    context.redirect('#/homeLogged');
                }).catch(notify.handleError);
        });

        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    notify.showInfo("Logout successfully!");
                    context.redirect('#/homeNotLogged');
                }).catch(notify.handleError);
        });

        this.get("#/homeLogged", function (context) {
            context.isAuthed = auth.isAuthed();
            context.userName = sessionStorage.getItem("username");
            context.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial("./templates/homeLogged.hbs");
            }).catch(notify.handleError);
        });

        this.get('#/myMesseges', function (context) {
            context.isAuthed = auth.isAuthed();
            context.userName = sessionStorage.getItem("username");
            messageService.getMyMesseges()
                .then(function (res) {
                    console.log(res);
                    res.forEach((el, index) => {
                        el.date = formatDate(el._kmd.ect);
                    });
                    context.messages = res;
                    context.loadPartials({
                        header: "./templates/common/header.hbs",
                        footer: "./templates/common/footer.hbs",
                        message: "./templates/common/myMessages-msg.hbs"
                    }).then(function () {
                        this.partial("./templates/myMessagesView.hbs");
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.get('#/sendMessege', function (context) {
            context.isAuthed = auth.isAuthed();
            context.userName = sessionStorage.getItem("username");
            messageService.listAllUsers()
                .then(function (options) {
                    console.log(options);
                    context.options = options;
                    context.loadPartials({
                        header: "./templates/common/header.hbs",
                        footer: "./templates/common/footer.hbs",
                        option: "./templates/common/send-msg-option.hbs"
                    }).then(function () {
                        this.partial("./templates/sendMsgView.hbs");
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.post('#/createMsg', function (context) {
           let data = {
               sender_username: sessionStorage.getItem("username"),
               sender_name: sessionStorage.getItem("name"),
               recipient_username: context.params.recipient,
               text: context.params.text
           };
           messageService.sendMessage(data)
               .then(function () {
                   context.redirect("#/archieve");
               }).catch(notify.handleError)
        });

        this.get('#/archieve', function (context) {
            context.isAuthed = auth.isAuthed();
            context.userName = sessionStorage.getItem("username");
            messageService.getArchieve()
                .then(function (res) {
                    res.forEach((el, index) => {
                        el.date = formatDate(el._kmd.ect);
                    });
                    context.messages = res;
                    context.loadPartials({
                        header: "./templates/common/header.hbs",
                        footer: "./templates/common/footer.hbs",
                        message: "./templates/common/archieve-msg.hbs"
                    }).then(function () {
                        this.partial("./templates/archieveview.hbs");
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.get("#/delete/:id", function (context) {
            messageService.deleteMsgById(context.params.id.slice(1))
                .then(function () {
                    context.redirect("#/archieve");
                }).catch(notify.handleError);
        });
    });

    app.run();
}

function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
        return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}

function formatSender(name, username) {
    if (!name)
        return username;
    else
        return username + ' (' + name + ')';
}
