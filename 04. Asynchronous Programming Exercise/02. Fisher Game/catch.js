function attachEvents() {
    const BASE_URL = `https://baas.kinvey.com/appdata/kid_r1G_ESmVQ/biggestCatches/`;
    const base64Auth = btoa("admin:admin");
    const authHeaders = {"Authorization":"Basic " + base64Auth};


    $('.load').on("click", loadCatches);
    $('.add').on("click", addCatch);
    $('.update').on("click", updateCatch);
    $('.delete').on("click", deleteCatch);

    function loadCatches() {
        $.ajax({
            method: "GET",
            url: BASE_URL,
            headers: authHeaders
        }).then(function (res) {
            $('#catches').empty();
            for (let fishCatch of res) {
                let div = $(`<div class="catch" data-id="${fishCatch._id}">`);
                div.append('<label>Angler</label>');
                div.append(`<input type="text" class="angler" value="${fishCatch.angler}">`);
                div.append('<label>Weight</label>');
                div.append(`<input type="number" class="weight" value="${fishCatch.weight}">`);
                div.append('<label>Species</label>');
                div.append(`<input type="text" class="species" value="${fishCatch.species}">`);
                div.append('<label>Location</label>');
                div.append(`<input type="text" class="location" value="${fishCatch.location}">`);
                div.append('<label>Bait</label>');
                div.append(`<input type="text" class="bait" value="${fishCatch.bait}">`);
                div.append('<label>Capture Time</label>');
                div.append(`<input type="text" class="captureTime" value="${fishCatch.captureTime}">`);
                let updateBtn = $('<button class="update">Update</button>').on("click", updateCatch);
                let deleteBtn = $('<button class="delete">Delete</button>').on("click", deleteCatch);
                div.append(updateBtn);
                div.append(deleteBtn);
                $('#catches').append(div);
            }
        }).catch(handleError);
    }

    function deleteCatch() {
        let id = $(this).parent().attr("data-id");
        console.log(id);
        $.ajax({
            method: "DELETE",
            url: BASE_URL + `${id}`,
            headers: {"Authorization": "Basic " + base64Auth, "Content-type": "application/json"},
        }).then(loadCatches)
            .catch(handleError);
    }

    function updateCatch() {
        let inputs = $(this).parent().find('input');
        let catchId = $(this).parent().attr('data-id');
        $.ajax({
            method: "PUT",
            url: BASE_URL + catchId,
            headers: {"Authorization": "Basic " + base64Auth, "Content-type": "application/json"},
            data: JSON.stringify({
                angler: $(inputs[0]).val(),
                weight: $(inputs[1]).val(),
                species: $(inputs[2]).val(),
                location: $(inputs[3]).val(),
                bait: $(inputs[4]).val(),
                captureTime: $(inputs[5]).val()
            })
        }).then(loadCatches)
            .catch(handleError);
    }

    function addCatch() {
        let inputs = $(this).parent().find('input');
        $.ajax({
            method: "POST",
            url: BASE_URL,
            headers: {"Authorization": "Basic " + base64Auth, "Content-type": "application/json"},
            data: JSON.stringify({
                angler: $(inputs[0]).val(),
                weight: Number($(inputs[1]).val()),
                species: $(inputs[2]).val(),
                location: $(inputs[3]).val(),
                bait: $(inputs[4]).val(),
                captureTime: Number($(inputs[5]).val())
            })
        }).then(loadCatches)
            .catch(handleError);
    }

    function handleError(err) {
        console.log(err.status);
    }
}