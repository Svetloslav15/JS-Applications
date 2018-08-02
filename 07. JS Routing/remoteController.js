const auth = (() => {
    const BASE_URL = "https://baas.kinvey.com";
    const APP_KEY = "kid_H1xrMGCEm";
    const APP_SECRET = "e5faea0621d14fe2b60fb95b45ac9d94";

    function makeAuth(auth){
        if (auth === "basic"){
            return "Basic " + btoa(APP_KEY + ":" + APP_SECRET);
        }
        else if (auth === "kinvey"){
            return "Kinvey " + localStorage.getItem("authToken");
        }
    }

    //request method
    //module (user, appdata)
    //url endpoint
    //auth
    function makeRequest(method, module, endpoint, auth){
        let request = {
            method: method,
            url: `${BASE_URL}/${module}/${APP_KEY}/${endpoint}`,
            headers: {
                'Authorization': makeAuth(auth)
            }
        };
        return request;
    }

    function get(module, endpoint, auth){
        return $.ajax(makeRequest("GET", module, endpoint, auth));
    }

    function post(module, endpoint, auth, data){
        let object = makeRequest("POST", module, endpoint, auth);
        if (data == ""){
            request.data = data;
        }
        return $.ajax(object);
    }

    function update(module, endpoint, auth, data){
        let object = makeRequest("PUT", module, endpoint, auth);
        object.data = data;
        return $.ajax(object);
    }

    function del(module, endpoint, auth, data){
        return $.ajax(makeRequest("DELETE", module, endpoint, auth));
    }

    return {get, post, update, del}
})();