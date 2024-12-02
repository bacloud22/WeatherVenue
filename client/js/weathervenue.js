import { Loader } from '@googlemaps/js-api-loader'
import { LIS } from './helpers/lis.js'
import { configUIControls } from './helpers/configUIControls.js'
import { getPicture } from './helpers/getPicture.js'
import { clearMarkers, getMarkers, showMarkers } from './helpers/map/refresh.js'
import { populateHeatMap } from './helpers/populateHeatMap.js'
import { refreshCenter } from './helpers/refreshCenter.js'
import { renderForecastDays } from './helpers/renderForecastDays.js'
import { renderPollution } from './helpers/renderPollution.js'
import { nearbyRequest, nearbyTriggeredRequest } from './helpers/requests.js'
import { ops } from './helpers/routines.js'
import { showAlertsList } from './helpers/showAlertsList.js'
import { state } from './state.js'
import introJs from 'intro.js/intro.js';
import { messages } from './libs/services/messages.js';
const currentLang = 'fr';



const today = new Date().toDateString()
LIS.id('date').innerHTML = today

export function initMap(first) {
    refreshCenter()
    // initMap() being called a second time, clear earlier data
    state.map.data.forEach((feature) => state.map.data.remove(feature))
    state.google.maps.event.trigger(state.map, 'resize')

    configUIControls()
    // _initAccessibility(state.language)
    // Populate current list of cities nearby on the map
    if (state.currentResponse.isValid) {
        state.map.data.addGeoJson(state.currentResponse.currentList)
        clearMarkers()
        getMarkers()
        showMarkers()
        state.map.data.setStyle({
            strokeColor: 'blue',
        })
        // Fit map size to its markers
        const bounds = new state.google.maps.LatLngBounds()
        state.map.data.forEach(function (feature) {
            feature.getGeometry().forEachLatLng(function (latlng) {
                bounds.extend(latlng)
            })
        })
        state.map.fitBounds(bounds)
        state.map.setCenter(state.center)
        state.map.setZoom(11)
        // Show alerts panel
        showAlertsList(state.currentResponse)
        populateHeatMap(0)
    }

    // Create the infoWindow for the center marker
    const infoWindow = new state.google.maps.InfoWindow()
    const infoWindowContent = LIS.id('infoWindow-content')
    const infoWindowContentPrime = infoWindowContent.cloneNode(true)
    infoWindow.setContent(infoWindowContent)
    const marker = new state.google.maps.Marker({
        map: state.map,
        animation: state.google.maps.Animation.DROP,
    })

    let latestClicked = ''
    // marker onclick: populate the forecast data on the HTML cards (renderForecastDays)
    if (state.markers && state.markers.length > 0) {
        state.markers.forEach((marker) => {
            marker.addListener('click', () => {
                state.currentMarked = marker.title
                // Do not render again when the same marker is clicked !
                if (latestClicked !== marker.title) {
                    latestClicked = marker.title
                }
                infoWindowContentPrime.getElementsByClassName('title')[0].innerHTML = marker.title
                infoWindow.close()
                infoWindow.setContent(infoWindowContentPrime)
                infoWindow.open(state.map, marker)
                toggleBounce()
                if (state.currentResponse.isValid) {
                    LIS.id('location').innerHTML = marker.title // state.currentResponse.location;
                    const cityWeather = state.currentResponse.weather.find((item) => item.cityName === marker.title)
                    const cityPollution = state.currentResponse.pollution.find(
                        (item) => item.cityName === marker.title,
                    )
                    renderForecastDays(cityWeather.daily)
                    renderPollution(cityPollution)
                }
            })
            marker.addListener('mousedown', (e) => {
                console.log('mousedown')
            })
            marker.addListener('rightclick', (e) => {
                configURLsControls(marker)
            })
            function toggleBounce() {
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null)
                } else {
                    state.markers.forEach((marker_) => {
                        marker_.setAnimation(null)
                    })
                    marker.setAnimation(state.google.maps.Animation.BOUNCE)
                }
            }
        })
    }

    // Define behavior for possible second searches
    state.autocomplete.addListener('place_changed', () => {
        if (!state.first && new Date().getTime() - state.last < 200) {
            console.log('quick re-call, ignore.')
            return
        }
        state.first = false
        state.last = new Date().getTime()
        infoWindow.close()
        const place = state.autocomplete.getPlace()
        if (!place.geometry) return
        if (place.geometry.viewport) {
            state.map.fitBounds(place.geometry.viewport)
        } else {
            state.map.setCenter(place.geometry.location)
            state.map.setZoom(11)
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
        })
        marker.setVisible(false)
        infoWindowContent.children.namedItem('place-name').textContent = place.name
        // infoWindowContent.children.namedItem("place-id").textContent =
        //     place.place_id;
        infoWindowContent.children.namedItem('place-address').textContent = place.formatted_address
        // infoWindow.open(map, marker);
        state.currentMarked = place.name
        getPicture(place.name)
        nearbyRequest(place)
        // refreshDzBorder()
        showAlertsList(state.currentResponse)
    })
    // Populate current alerts of all cities on a floating HTML panel on the map
    showAlertsList(state.currentResponse)
}

const loader = new Loader({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'visualization'],
})

loader.importLibrary('maps')
    .then(async ({ Map }) => {
        state.googleLib['Map'] = Map;

        state.map = new Map(LIS.id('map'), {
            center: state.center,
            zoom: 10,
            rotateControl: false,
            mapTypeControl: false,
            streetViewControl: false,
        })
        // Trigger first request automatically
        state.language = 'fr'
        const centerLocation = process.env.CENTER_LOCATION
        state.currentMarked = centerLocation
        state.center.lat = process.env.DEFAULT_LAT
        state.center.lng = process.env.DEFAULT_LNG
        const pos = {
            lat: Number(state.center.lat),
            lng: Number(state.center.lng),
        }
        state.map.setCenter(pos)
        pos.name = centerLocation.charAt(0).toUpperCase() + centerLocation.slice(1)
        nearbyTriggeredRequest(pos)
        LIS.id('imgGrid').innerHTML = ''



        // TODO: Loop over all TempretureCard#html() and attach these functions to events
        // Attach events
    LIS.id('startover').onclick = ops.emptyIt;
    LIS.id('comparision-items').ondrop = (event) => ops.drop(event);
    LIS.id('comparision-items').ondragover = (event) => ops.allowDrop(event);

    LIS.id('intro').onclick = () => {
        const intro = introJs();
        intro.setOptions({
            steps: [
                { intro: messages.tour[currentLang].map },
                { element: '#location', intro: messages.tour[currentLang].cards },
                { element: '#comparision-items', intro: messages.tour[currentLang].comparision },
                { element: '#imgGrid', intro: messages.tour[currentLang].gallery },
            ],
            showProgress: true,
            scrollToElement: true,
        });
        intro.start();
    };
});

// TODO: deprecated !
loader.load().then((google) => {
    state.google = google
})


