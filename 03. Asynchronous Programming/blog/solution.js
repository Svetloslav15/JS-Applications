function attachEvents() {
    const URL = `https://baas.kinvey.com/appdata/kid_r1BSz9yNX/`;
    const USERNAME = "Peter";
    const PASSWORD = "p";
    const BASE_64 = btoa(USERNAME + ":" + PASSWORD);
    const AUTH = {"Authorization": 'Basic ' +  BASE_64};
    const SELECT = $('#posts');
    const TITLE = $('#post-title');

    $('#btnLoadPosts').on("click", loadPosts);
    $('#btnViewPost').on("click", viewPost);

    function loadPosts() {
        $.ajax({
            method: "GET",
            url: URL + "posts",
            headers: AUTH
        }).then(function (res) {
            for (let post of res) {
                console.log(post);
                SELECT.append(`<option body="${post.body}" postId="${post._id}">${post.title}</option>`);
            }
        }).catch(function (err) {
            console.log(err);
        })
    }

    function viewPost() {
        $('#post-body').empty();
        $('#post-comments').empty();
        let element = $('select option:selected');
        let value = element.text();
        let body = element.attr("body");
        $('#post-body').append(`<li>${body}</li>`);
        let postId = element.attr('postId');
        TITLE.text(value);

        $.ajax({
            method: "GET",
            url: URL + 'comments' + `/?query={"post_id":"${postId}`,
            headers: AUTH
        }).then(function (res) {
            for (let com of res) {
                $('#post-comments').append(`<li>${com.text}</li>`);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
}