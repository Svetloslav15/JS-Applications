$(() => {
    const app = Sammy('#container', function () {
        this.use("Handlebars", "hbs");

        this.get('index.html', function () {
            if (auth.isAuthed()) {
                this.redirect('#/catalog');
            }
            else {
                this.redirect('#/home');
            }
        });

        this.get('#/home', function () {
            this.loadPartials({
                header: "./templates/common/header.hbs",
                footer: "./templates/common/footer.hbs",
            }).then(function () {
                this.partial('./templates/homePageView.hbs');
            });
        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPass = context.params.repeatPass;
            if (username.length >= 3 && password === repeatPass &&
                username.match(/^[a-zA-Z]+$/) && password.length >= 6 &&
                password.match(/^[a-zA-Z0-9]+$/)) {
                auth.register(username, password)
                    .then(function (res) {
                        auth.saveSession(res);
                        context.redirect('#/catalog');
                        notify.showInfo("Successfully registered!");
                    }).catch(notify.handleError);
            }
            else {
                notify.showError("Invalid credentials!");
                context.redirect('#/home');
            }
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            if (username.length >= 3 && username.match(/^[a-zA-Z]+$/) && password.length >= 6 &&
                password.match(/^[a-zA-Z0-9]+$/)) {
                auth.login(username, password)
                    .then(function (data) {
                        auth.saveSession(data);
                        notify.showInfo("Successfully login!");
                        context.redirect('#/catalog');
                    }).catch(notify.handleError);
            }
            else {
                notify.showError("Invalid credentials!");
                context.redirect('#/home');
            }
        });

        this.get('#/catalog', function (context) {
            posts.getAllPosts()
                .then((posts) => {
                    posts.forEach((p, i) => {
                        p.rank = i + 1;
                        p.date = calcTime(p._kmd.ect);
                        p.isAuthor = p._acl.creator === sessionStorage.getItem('id');
                    });

                    context.isAuthed = auth.isAuthed();
                    context.username = sessionStorage.getItem('username');
                    context.posts = posts;

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        post: './templates/common/catalogPost.hbs'
                    }).then(function () {
                        this.partial('./templates/catalogView.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/logout', function (context) {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    notify.showInfo("Logout successfully!");
                    context.redirect('#/home');
                }).catch(notify.handleError);
        });

        this.get('#/createPost', function (context) {
            context.isAuthed = auth.isAuthed();
            context.username = sessionStorage.getItem('username');
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                navigation: './templates/common/navigation.hbs',
            }).then(function () {
                this.partial('./templates/createPostView.hbs');
            });
        });

        this.post('#/createPost', function (context) {
            let object = {
                author: sessionStorage.getItem('username'),
                url: context.params.url,
                imageUrl: context.params.imageUrl,
                title: context.params.title,
                description: context.params.description
            };
            if (object.title === '') {
                notify.showError('Title is required!');
            }
            else if (object.url === '') {
                notify.showError('Url is required!');
            }
            else if (!object.url.startsWith('http')) {
                notify.showError('Url must be a valid link!');
            }
            else {
                posts.createPost(object)
                    .then(function () {
                        notify.showInfo('Post created.');
                        context.redirect('#/catalog');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/edit/post/:id', function (context) {
            let id = context.params.id.slice(1);
            posts.getPostById(id)
                .then(function (res) {
                    context.post = res;
                    context.isAuthed = auth.isAuthed();
                    context.username = sessionStorage.getItem('username');
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                    }).then(function () {
                        this.partial('./templates/editPostView.hbs');
                    });
                });
        });

        this.post('#/edit/post', function (context) {
            let id = context.params.postId.slice(1);
            let object = {
                author: sessionStorage.getItem('username'),
                url: context.params.url,
                imageUrl: context.params.image,
                title: context.params.title,
                description: context.params.description
            };
            posts.editPostById(id, object)
                .then(function () {
                    notify.showInfo("Post edited.");
                    context.redirect("#/catalog");
                }).catch(notify.handleError);
        });

        this.get('#/delete/post/:id', function (context) {
           let id = context.params.id.slice(1);
           posts.deletePostById(id)
               .then(function () {
                   notify.showInfo("Post deleted.");
                   context.redirect("#/catalog");
               }).catch(notify.handleError);
        });

        this.get('#/myPosts', function (context) {
            context.username = sessionStorage.getItem("username");
            context.isAuthed = auth.isAuthed();
            posts.getMyPosts()
                .then((posts) => {
                    posts.forEach((p, i) => {
                        p.rank = i + 1;
                        p.date = calcTime(p._kmd.ect);
                        p.isAuthor = p._acl.creator === sessionStorage.getItem('id');
                    });

                    context.isAuthed = auth.isAuthed();
                    context.username = sessionStorage.getItem('username');
                    context.posts = posts;

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        navigation: './templates/common/navigation.hbs',
                        post: './templates/common/catalogPost.hbs'
                    }).then(function () {
                        this.partial('./templates/myPostsView.hbs');
                    });
                })
                .catch(notify.handleError);
        });

        this.get('#/details/post/:id', function (context) {
           let id = context.params.id.slice(1);
            posts.getPostById(id)
               .then(function (post) {
                   context.post = post;
                   context.date = calcTime(post._kmd.ect);
                   context.isAuthor = post._acl.creator === sessionStorage.getItem('id');
                   context.username = sessionStorage.getItem("username");
                   context.isAuthed = auth.isAuthed();

                   comments.getCommentsByPostId(id)
                       .then(function (res) {
                           context.comments = res;
                           res.forEach((el, index) => {
                                el.isAuthor = el.author === sessionStorage.getItem("username");
                           });
                           context.loadPartials({
                               header: './templates/common/header.hbs',
                               footer: './templates/common/footer.hbs',
                               navigation: './templates/common/navigation.hbs',
                               comment: './templates/common/commentView.hbs'
                           }).then(function () {
                               this.partial("./templates/postDetails.hbs");
                           })
                       })
               })
        });

        this.post('#/create/comment', function (context) {
            let postId = context.params.postId;
            let content = context.params.content;
            if (content !== "") {
                let object = {
                    content: content,
                    author: sessionStorage.getItem("username"),
                    postId: postId
                };
                comments.createComment(object)
                    .then(function (res) {
                        console.log(res);
                        notify.showInfo("Comment created.");
                        context.redirect(`#/details/post/:${postId}`);
                    }).catch(notify.handleError);
            }
            else{
                notify.showError("Cannot post empty comment!");
                context.redirect(`#/details/post/:${postId}`);
            }
        });

        this.get('#/comment/delete/:commentId/post/:postId', function (context) {
            let commentId = context.params.commentId;
            let postId = context.params.postId;
            comments.deleteCommentById(commentId)
                .then(function () {
                    notify.showInfo("Comment deleted.");
                    context.redirect(`#/details/post/:${postId}`);
                }).catch(notify.handleError);
        });
    });

    app.run();
});

function calcTime(dateIsoFormat) {
    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);

    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}
