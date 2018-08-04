let comments = (() => {
    function getCommentsByPostId(id) {
        return remote.get("appdata", `comments?query={"postId":"${id}"}&sort={"_kmd.ect": -1}`, "kinvey");
    }

    function createComment(data) {
        return remote.post("appdata", "comments", data, "kinvey");
    }

    function deleteCommentById(id) {
        return remote.remove("appdata", `comments/${id}`, "kinvey");
    }

    return {
        getCommentsByPostId, createComment, deleteCommentById
    }
})();