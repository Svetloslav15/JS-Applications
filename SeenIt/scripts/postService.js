let posts = (() => {
    function getAllPosts() {
        let endpoint = 'posts?query={}&sort={"_kmd.ect": -1}';
        return remote.get("appdata", endpoint, "kinvey");
    }
    function createPost(data) {
        return remote.post('appdata', 'posts', data, "kinvey");
    }

    function getPostById(id) {
        return remote.get('appdata', `posts/${id}`, 'kinvey');
    }

    function editPostById(id, data) {
        return remote.update("appdata", `posts/${id}`, data, "kinvey");
    }

    function deletePostById(id) {
        return remote.remove("appdata", `posts/${id}`, "kinvey");
    }

    function getMyPosts() {
        let endpoint = `posts?query={"author":"${sessionStorage.getItem("username")}"}&sort={"_kmd.ect": -1}`;
        return remote.get("appdata", endpoint, "kinvey");
    }
    return {
        getAllPosts,
        createPost,
        getPostById,
        editPostById,
        deletePostById,
        getMyPosts
    }
})();