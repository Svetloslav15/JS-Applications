const service = (() => {
    function getAllCars() {
        let endpoint = `cars?query={}&sort={"_kmd.ect": -1}`;
        return remote.get("appdata", endpoint, "kinvey")
    }

    function createCar(data) {
        return remote.post("appdata", "cars", data, "kinvey");
    }

    function deleteCarById(id) {
        return remote.remove("appdata", `cars/${id}`, "kinvey");
    }

    function getMyCars() {
        let endpoint = `cars?query={"seller":"${sessionStorage.getItem("username")}"}&sort={"_kmd.ect": -1}`;
        return remote.get("appdata", endpoint, "kinvey");
    }

    function getCarById(id) {
        return remote.get("appdata", `cars/${id}`, "kinvey");
    }

    function editCar(data, id) {
        return remote.update("appdata", `cars/${id}`, data, "kinvey");
    }

    return {
        getAllCars, createCar, deleteCarById, getMyCars, getCarById, editCar
    }
})();