const auth = (() => {
    function isAuthed() {
        return sessionStorage.getItem('authtoken') !== null;
    }

    function saveSession(data) {
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('id', data._id);
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('authtoken', data._kmd.authtoken);
    }

    function login(username, password) {
        return remote.post('user', 'login', {username, password}, 'basic');
    }

    async function register(username, password, name) {
        return remote.post('user', '', {username, password, name}, 'basic');
    }

    async function logout() {
        return remote.post('user', '_logout', {authtoken: sessionStorage.getItem('authtoken')});
    }

    return {
        saveSession, login, register, logout, isAuthed
    }
})();