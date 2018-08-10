const messageService = (() => {
    function getMyMesseges() {
        let endpoint = `messages?query={"recipient_username":"${sessionStorage.getItem("username")}"}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function listAllUsers() {
        return remote.get("user", "", "kinvey");
    }

    function sendMessage(data) {
        return remote.post("appdata", "messages", data, "kinvey");
    }

    function getArchieve() {
        let endpoint = `messages?query={"sender_username":"${sessionStorage.getItem("username")}"}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function deleteMsgById(id) {
        return remote.remove("appdata", `messages/${id}`, "kinvey")
    }

    return {
        getMyMesseges, listAllUsers, sendMessage, getArchieve, deleteMsgById
    }
})();