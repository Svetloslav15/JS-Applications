function attachEvents() {
    const BASE_URL = "https://judgetests.firebaseio.com/";

    $('#submit').on("click", getWeather);
    const weather = {
        Sunny: "&#x2600",
        "Partly sunny": "&#x26C5",
        Overcast: "&#x2601",
        Rain: "&#x2601",
        Degrees: "&#176",
    };

    function getWeather() {
        let location = $('#location').val();
        $.ajax({
            method: "GET",
            url: BASE_URL + "locations.json"
        }).then(function (res) {
            for (let obj of res) {
                if (obj.name === location) {
                    getForecast(obj.code);
                    break;
                }
            }
        }).catch(handleError);
    }

    function getForecast(code) {
        $.ajax({
            method: "GET",
            url: BASE_URL + `forecast/today/${code}.json`
        }).then(function (res) {
            $('#forecast').css("display", "block");
            let container = $('#current');
            container.empty();
            container.append(`<span class="label">Current conditions</span>`);
            let currentW = res.forecast.condition;
            container.append(`<span class="condition symbol">${weather[currentW]}</span>`);
            let innerConditions = $(`<span class="condition">`);
            innerConditions.empty();
            innerConditions.append(`<span class="forecast-data">${res.name}</span>`);
            innerConditions.append(`<span class="forecast-data">${res.forecast.low}&#176/${res.forecast.high}&#176</span>`);
            innerConditions.append(`<span class="forecast-data">${res.forecast.condition}</span>`);
            container.append(innerConditions);

            loadUpcoming(code);

        }).catch(handleError);
    }

    function handleError(err) {
        console.log(err);
    }

    function loadUpcoming(code) {
        let upcomingContainer = $('#upcoming');
        upcomingContainer.empty();
        upcomingContainer.append(`<div class="label">Three-day forecast</div>`);
        $.ajax({
            method: "GET",
            url: BASE_URL +  `forecast/upcoming/${code}.json`
        }).then(function (res) {
            console.log(res.forecast);
            for (let obj of res.forecast) {
                let span = $('<span class="upcoming">');
                span.append($(`<span class="symbol">${weather[obj.condition]}</span>`));
                span.append($(`<span class="forecast-data">${obj.high}&#176;/${obj.low}&#176;</span>`));
                span.append($(`<span class="forecast-data">${obj.condition}</span>`));
                upcomingContainer.append(span);
            }
        }).catch(handleError);
    }
}