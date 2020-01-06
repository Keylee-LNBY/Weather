var date = moment().format("L");
var city;
var cities = [];
var cityLocStore = JSON.parse(localStorage.getItem("cities")) || cities;
var APIKey = "4220ef085e0bb7e913a6f6b855ed11c3";

//Create a function to pull weather information from the weather API
function currentWeather() {
    fiveDayForcast(city);
    //Pull Current Weather for searched City 
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    })

    //Once API info is pulled - display on html
    .then(function(response) {
        console.log(response);
        console.log("Get here - script.js - line 23");

        $(".city-name").html(response.name + " (" + date + ") ");
        $(".weather-display").attr("src","http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png");
        $(".temp").html("Temperature: " + ((response.main.temp - 273.15) * 1.8 + 32).toFixed(2) + "&#176;F");
        $(".humidity").text("Humidity: " + response.main.humidity + "%");
        $(".wind").html("Wind Speed: " + response.wind.speed + " MPH");

        console.log("Get here - script.js - line 31");

        var uvLat = response.coord.lat;
        var uvLon = response.coord.lon;
        
        uvIndex(uvLat, uvLon);
    })
    .catch(e => alert("Error: Please try another city"));
};

//Create a function to populate the 5-Day Forcast section
function fiveDayForcast(city) {
    var queryURLFive = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + APIKey;

    var dateArray = [];
    var iconArray = [];
    var tempArray = [];
    var humidityArray = [];

    $.ajax({
        url: queryURLFive,
        method: "GET"
    })
    
    .then(function(response) {

        console.log(response);
        console.log("Get here - script.js - line 58");

        for (var i = 0; i < 40; i++) {
            var option = response.list[i].dt_txt.substring(11);
            var dateValue = response.list[i].dt_txt.substring(0, 10);
            var currentDate = moment().format("YYYY-MM-DD");

            if ("15:00:00" == option && dateValue != currentDate) {
            //Convert the date using moment js
                var dateString = response.list[i].dt_txt.substring(0, 10);
                var date = new moment(dateString);

                //Format Date
                var formatDate = date.format("MM/DD/YYYY");
                    console.log("Get here - script.js - line 72. Date Format: " + formatDate);

                //Push formatted date to an array
                dateArray.push(formatDate);

                //Icon
                iconArray.push(response.list[i].weather[0].icon);
                
                //Pull Kelvin Temperature & convert to F
                tempArray.push(((response.list[i].main.temp - 273.15) * 1.8 + 32).toFixed(2));

                //Humidity
                humidityArray.push(response.list[i].main.humidity);
            };
        };

        //Clear the Forcast
        for (var i = 0; i < dateArray.length; i++) {
            $(".forecast" + [i]).empty();
            console.log("Get here - script.js - line 91 - forcast clearing in the fiveDayForcast()");
        };

        //Append API information to the html page
        for (var i = 0; i < dateArray.length; i++) {
            //Append Date
            var newDate = $("<h4>").text(dateArray[i]);
                $(".forecast" + [i]).append(newDate);

            //Append Icon
            var newImg = $("<img>");
                newImg.attr("src", "http://openweathermap.org/img/wn/" + iconArray[i] + "@2x.png");
                $(".forecast" + [i]).append(newImg);

            //Append Tempurature
            var newTemp = $("<p>").html("Temp: " + tempArray[i] + "&#176;F");
                $(".forecast" + [i]).append(newTemp);

            //Addend Humitity
            var newHumidity = $("<p>").html("Humidity: " + humidityArray[i] + "%");
                $(".forecast" + [i]).append(newHumidity);

                console.log("Get here - script.js - line 113");
        };
    });
};

//Create a function that clears the information of the previous city, so the new city information can be added
function clearingButton() {
    $("#buttons-view").empty();

    for (var i = 0; i < cityLocStore.length; i++) {
        var a = $("<button>");
        a.addClass("btn city big-btn");
        a.attr("data-name", cityLocStore[i]);
        a.text(cityLocStore[i]);
        $("#buttons-view").append(a);
    };
    console.log("Get here - script.js - line 129");
};

// Search Button/Add City Button
$("#add-city").on("click", function(event) {
    event.preventDefault();
    var cityInput = $("#city-input")
        .val()
        .trim();

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    })

    .then(function(response) {

        cityLocStore.push(cityInput);
        localStorage.setItem("cities", JSON.stringify(cityLocStore));
        clearingButton();
        city = cityInput;
        $("#city-input, textarea").val("");
        currentWeather();
    })

    .catch(e => alert("Error: Please try another city"));
    console.log("Get here - script.js - line 159");
});

//UV Index that changes color based on the UV Value
function uvIndex(uvLat, uvLon) {
    //Pull UV Index for searched City
    var queryURLUV = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + uvLat + "&lon=" + uvLon;

    $.ajax({
        url: queryURLUV,
        method: "GET"
    })
    
    .then(function(response) {
        console.log(response);
        console.log("Get here - script.js - line 172");

        var uvIndexResults = response.value;
        var uvIndexButton = $("<span>").text(response.value);

        $(".uv-index").text("UV Index: ");
        $(".uv-index").append(uvIndexButton);

        if (response.value < 3.0) {
            uvIndexButton.attr("class", "green-uv");

        } else if (response.value >= 3.0 && response.value < 6.0) {
            uvIndexButton.attr("class", "yellow-uv");

        } else if (response.value >= 6.0 && response.value < 8.0) {
            uvIndexButton.attr("class", "orange-uv");

        } else if (response.value >= 8.0 && response.value < 11.0) {
            uvIndexButton.attr("class", "red-uv");
            
        } else if (response.value >= 11.0) {
            uvIndexButton.attr("class", "purple-uv");
        };
    });
    console.log("Get here - script.js - line 196");
};

//On Click for Add City Button
$(document).on("click", ".city", function() {
    city = $(this).attr("data-name");
    currentWeather();
    console.log("Get here - script.js - line 203");
});

clearingButton();

