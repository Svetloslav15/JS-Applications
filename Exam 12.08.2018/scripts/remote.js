const remote = (() => {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_ry1If3aBm';
    const appSecret = '33b8e9c953cc4017af7a20321f6319a1';

    function makeAuth(type) {
        if (type === 'basic') {
            return 'Basic ' + btoa(appKey + ':' + appSecret);
        }
        else {
            return 'Kinvey ' + sessionStorage.getItem('authtoken');
        }
    }

    function makeRequest(method, module, url, auth) {
        return req = {
            url: baseUrl + module + '/' + appKey + '/' + url,
            method,
            headers: {
                'Authorization': makeAuth(auth)
            }
        };
    }

    function get(module, url, auth) {
        return $.ajax(makeRequest('GET', module, url, auth));
    }

    function post(module, url, data, auth) {
        let req = makeRequest('POST', module, url, auth);
        req.data = JSON.stringify(data);
        req.headers['Content-Type'] = 'application/json';
        return $.ajax(req);
    }

    function update(module, url, data, auth) {
        let req = makeRequest('PUT', module, url, auth);
        req.data = JSON.stringify(data);
        req.headers['Content-Type'] = 'application/json';
        return $.ajax(req);
    }

    function remove(module, url, auth) {
        return $.ajax(makeRequest('DELETE', module, url, auth));
    }

    return {
        get, post, update, remove, baseUrl, appKey
    }
})();