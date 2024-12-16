import { Loader } from '@googlemaps/js-api-loader'
import { LIS } from './helpers/lis.js'
import { state } from './state.js'
import introJs from 'intro.js/intro.js'

const loader = new Loader({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'visualization'],
})

let _ControlPosition;
loader.importLibrary('core')
    .then(async ({ ControlPosition }) => {
        _ControlPosition = ControlPosition;
    })

loader.importLibrary('maps')
    .then(async ({ Map }) => {
        state.googleLib['Map'] = Map;


        // TODO: deprecated !
        loader.load().then((google) => {
            state.google = google

            state.map2 = new Map(LIS.id('map-canvas'), {
                zoom: 10,
                center: new state.google.maps.LatLng(36.1636, 6.1838),
                zoomControl: false,
                gestureHandling: "none",
                fullscreenControl: false
            });

            const infoWindow = new state.google.maps.InfoWindow();
            const locationButton = document.createElement("button");
            locationButton.textContent = "Go to Current Location";
            locationButton.classList.add("custom-map-control-button");
            state.map2.controls[_ControlPosition.TOP_CENTER].push(locationButton);
            locationButton.addEventListener("click", () => {
                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            infoWindow.setPosition(pos);
                            infoWindow.setContent("Location found.");
                            infoWindow.open(state.map2);
                            state.map2.setCenter(pos);
                        },
                        () => {
                            handleLocationError(true, infoWindow, state.map2.getCenter());
                        }
                    );
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, state.map2.getCenter());
                }
            });


            // Add interaction listeners to make weather requests
            state.google.maps.event.addListener(state.map2, 'idle', checkIfDataRequested);

            // Sets up and populates the info window with details
            state.map2.data.addListener('click', function (event) {
                infoWindow.setContent(
                    "<img src=" + event.feature.getProperty("icon") + ">"
                    + "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
                    + "<br />" + event.feature.getProperty("temperature") + "&deg;C"
                    + "<br />" + event.feature.getProperty("weather")
                );
                infoWindow.setOptions({
                    position: {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    },
                    pixelOffset: {
                        width: 0,
                        height: -15
                    }
                });
                infoWindow.open(state.map2);
            });
        })
    });

let geoJSON;
let request;
let gettingData = false;
let openWeatherMapKey = ''

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(state.map2);
}


const checkIfDataRequested = function () {
    // Stop extra requests being sent
    while (gettingData === true) {
        request.abort();
        gettingData = false;
    }
    getCoords();
};

// Get the coordinates from the Map bounds
const getCoords = function () {
    let bounds = state.map2.getBounds();
    let NE = bounds.getNorthEast();
    let SW = bounds.getSouthWest();
    getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
};

// Make the weather request
const getWeather = function (northLat, eastLng, southLat, westLng) {
    gettingData = true;
    const requestObject = new URLSearchParams({
        westLng: westLng,
        northLat: northLat,
        eastLng: eastLng,
        southLat: southLat,
        mapZoom: state.map2.getZoom()
    }).toString();
    request = new XMLHttpRequest();
    request.onload = proccessResults;
    request.open("get", 'big_weather_map?' + requestObject, true);
    request.responseType = 'json'
    request.send();
};

// Take the JSON results and proccess them
const proccessResults = function () {
    // console.log(this);
    let results = this.response.data;
    if (results.list.length > 0) {
        resetData();
        for (let i = 0; i < results.list.length; i++) {
            geoJSON.features.push(jsonToGeoJson(results.list[i]));
        }
        drawIcons(geoJSON);
    }
};

// For each result that comes back, convert the data to geoJSON
const jsonToGeoJson = function (weatherItem) {
    let feature = {
        type: "Feature",
        properties: {
            city: weatherItem.name,
            weather: weatherItem.weather[0].main,
            temperature: weatherItem.main.temp,
            min: weatherItem.main.temp_min,
            max: weatherItem.main.temp_max,
            humidity: weatherItem.main.humidity,
            pressure: weatherItem.main.pressure,
            windSpeed: weatherItem.wind.speed,
            windDegrees: weatherItem.wind.deg,
            windGust: weatherItem.wind.gust,
            icon: "https://openweathermap.org/img/w/"
                + weatherItem.weather[0].icon + ".png",
            coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
        },
        geometry: {
            type: "Point",
            coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
        }
    };
    // Set the custom marker icon
    state.map2.data.setStyle(function (feature) {
        return {
            icon: {
                url: feature.getProperty('icon'),
                anchor: new google.maps.Point(25, 25)
            }
        };
    });

    // returns object
    return feature;
};

// Add the markers to the map
const drawIcons = function (weather) {
    state.map2.data.addGeoJson(geoJSON);
    // Set the flag to finished
    gettingData = false;
};

// Clear data layer and geoJSON
const resetData = function () {
    geoJSON = {
        type: "FeatureCollection",
        features: []
    };
    state.map2.data.forEach(function (feature) {
        state.map2.data.remove(feature);
    });
};

LIS.id('intro').onclick = () => {
    const intro = introJs();
    intro.setOptions({
        steps: [
        ],
        showProgress: true,
        scrollToElement: true,
    });
    intro.start();
};
