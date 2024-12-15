// import { Client } from "@googlemaps/google-maps-services-js";
import { LIS } from "./lis.js";
import { state } from "../state.js";
import isMobile from "./isMobile.js";
import { populateHeatMap } from "./populateHeatMap.js";
import { conf, ops } from "./routines.js";
import { Loader } from "@googlemaps/js-api-loader";
import screenfull from 'screenfull';

// const client = new Client({});
function __class(cls) { return document.getElementsByClassName(cls) }
// Instantiate new UI controls for DOM page or Google map. Configure UI controls or retrieve present UI controls when they exist.

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

export const configUIControls = () => {
    // First time visit: style map night or regular based on earlier preferences
    // TODO: force light mode until fixing dark mode
    localStorage.setItem('darkSwitch', null)

    const darkThemeSelected =
        localStorage.getItem('darkSwitch') !== null && localStorage.getItem('darkSwitch') === 'dark'
    darkThemeSelected ? ops.styleItDark() : ops.styleItWhite()
    // Define on toggle behavior.
    state.google.maps.event.addDomListener(LIS.id('darkSwitch'), 'click', function () {
        const toggle =
            localStorage.getItem('darkSwitch') !== null && localStorage.getItem('darkSwitch') === 'dark'
        toggle ? ops.styleItWhite() : ops.styleItDark()
    })

    // Slider
    const slider = LIS.id('formControlRange')
    const sliderForm = LIS.id('formControlRange0')
    let moving
    if (!isMobile) {
        state.map.controls[_ControlPosition.TOP_LEFT].clear()
        state.map.controls[_ControlPosition.TOP_LEFT].push(sliderForm)
    }
    slider.oninput = function () {
        LIS.id('rangeval').innerHTML = `Day ${slider.value}`
        moving = populateHeatMap(slider.value - 1)
        if (!moving) {
            slider.value = 1
            LIS.id('rangeval').innerHTML = day - 1
        }
    }

    // Create the autocompletion search bar if does not exist already
    let input = LIS.id('pac-input')
    if (input == null) {
        const div = document.createElement('INPUT')
        div.id = 'pac-input'
        div.className = 'controls'
        div.type = 'text'
        div.placeholder = 'enter-a-location'
        document.body.appendChild(div)
        input = LIS.id('pac-input')
    }
    if (!state.autocomplete) {

        state.autocomplete = new state.google.maps.places.Autocomplete(input, conf.autocompleteOptions)
        state.map.controls[_ControlPosition.TOP_CENTER].clear()
        state.map.controls[_ControlPosition.TOP_CENTER].push(input)
        state.autocomplete.bindTo('bounds', state.map)
        // Specify just the place data fields that you need.
        state.autocomplete.setFields(['place_id', 'geometry', 'name'])
    }

    // Geolocation
    state.currentMarked = 'geolocated'
    // Create Geolocation button if it does not exist
    const panButton = __class('custom-map-control-button')[0]
    if (panButton) {
        return
    }

    const infoWindow = new state.google.maps.InfoWindow()
    const locationButton = document.createElement('button')
    locationButton.textContent = 'Go to Current Location'
    locationButton.classList.add('custom-map-control-button')
    locationButton.setAttribute('type', 'submit')
    state.map.controls[_ControlPosition.TOP_RIGHT].clear()
    state.map.controls[_ControlPosition.TOP_RIGHT].push(locationButton)
    locationButton.addEventListener('click', () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    infoWindow.setPosition(pos)
                    infoWindow.setContent(location - found)
                    infoWindow.open(state.map)
                    state.map.setCenter(pos)
                    pos.name = 'current-place'
                    nearbyTriggeredRequest(pos)
                    LIS.id('imgGrid').innerHTML = ''
                    showAlertsList(state.currentResponse)
                },
                () => {
                    handleLocationError(true, infoWindow, state.map.getCenter())
                },
            )
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, state.map.getCenter())
        }
    })

    const fullScreenBtn = LIS.id('fullscreen');
    fullScreenBtn.addEventListener('click', () => {
        if (screenfull.isEnabled) {
            screenfull.request();
        } else {
            // Ignore or do something else
        }
    });
    screenfull.on('change', () => {
        screenfull.isFullscreen ? fullScreenBtn.style.visibility = "hidden" : fullScreenBtn.style.visibility = "visible";
    });
}

// When browser doesn't support Geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos)
    infoWindow.setContent(
        browserHasGeolocation
            ? 'Error: the geolocation service failed'
            : 'Error: your browser doesnt support geolocation',
    )
    infoWindow.open(state.map)
}
