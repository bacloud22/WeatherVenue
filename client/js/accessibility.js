let __currentSpokenCity
let paragraph
let __currentSpokenForecast
 
function searchPlace () {
  const autocompleteService = new google.maps.places.AutocompleteService()
  const placesService = new google.maps.places.PlacesService(map)
  if (!__currentSpokenCity) {
    return
  }
  const fetchSuggestions = function (predictions, status) {
    const fetchPlaceDetails = function (placeResults, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        speak('I am sorry, there was an error final results')
        return
      }
      // this will fill __currentSpokenForecast with a transcript for Weather forecast
      nearbyRequest(placeResults)
      setTimeout(function () {
        speak(__currentSpokenForecast)
      }, 3000)
    }
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      speak('I am sorry, I could not find any city for ' + __currentSpokenCity)
      return
    }
    speak('I am now looking for ' + predictions[0].terms[0].value)
    placesService.getDetails({ placeId: predictions[0].place_id }, fetchPlaceDetails)
  }
  // service.getQueryPredictions({ input: __currentSpokenCity }, fetchSuggestions)
  autocompleteService.getPlacePredictions({ input: __currentSpokenCity, types: ['(cities)']/*, componentRestrictions: { country: 'fr' }*/ }, fetchSuggestions)
}
 
var synth
var SpeechRecognition
var recognition
 
function speak (paragraph) {
  if (synth.speaking) {
    console.error('speechSynthesis.speaking')
    return
  }
  const text = new SpeechSynthesisUtterance(paragraph)
  text.lang = 'en-US'
  text.onend = function (event) {
    console.log('SpeechSynthesisUtterance.onend')
  }
  text.onerror = function (event) {
    console.error('SpeechSynthesisUtterance.onerror')
  }
  synth.speak(text)
}
 
function _fireAccessFunctions (first, justRefresh) {
  if (!first) {
    if (recognition)
      recognition = undefined
    return
  }
  if (typeof (webkitSpeechRecognition) === 'undefined') {
    console.log('browser does not support speech recognition')
    return
  }
  synth = window.speechSynthesis
  SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
 
  document.body.onkeyup = function (e) {
    if (recognition && e.key === ' ') {
      recognition.start()
      console.log('Ready to receive a new city command.')
    }
    if (synth.speaking && e.key === 'Control') {
      synth.cancel()
      console.log('You shut me up.')
    }
  }
  recognition.onresult = function (event) {
    const city = event.results[0][0].transcript
    console.log('Result received: ' + city + '.')
    const confidence = event.results[0][0].confidence
    console.log('Confidence: ' + confidence)
    if (confidence > 0.9) {
      paragraph = 'Is it ' + city + '?'
      speak(paragraph)
      __currentSpokenCity = city
      searchPlace()
    }
    else {
      paragraph = 'I am sorry, could you say that again ?'
      speak(paragraph)
    }
  }
  recognition.onspeechend = function () {
    recognition.stop()
  }
  recognition.onnomatch = function (event) {
    console.log("I didn't recognise that city.")
  }
  recognition.onerror = function (event) {
    console.log('Error occurred in recognition: ' + event.error)
  }
  if (!justRefresh) {
    paragraph = 'Hello, Weather Venue is accessible through speech although not fully garanteed. I will assist you on how to look for a city weather forecast. Whenever you want to look for a city, tap spacebar then tell using microphone the name of the city. If you want to interrupt me tap control.'
    speak(paragraph)
  }
}
 
function _initAccessibility(language) {
  // Accessibility is supported only for English
  if (language === 'en') {
    // accessibility
    const choiceViaLS = localStorage.getItem('accessibilitySwitch') !== null && localStorage.getItem('accessibilitySwitch') === 'true'
    __id('accessibilitySwitch').addEventListener('click', function () {
      console.log('accessibilitySwitch clicked ')
      const isChecked = __id('accessibilitySwitch').checked
      const value = isChecked ? 1 : 0
      value ? localStorage.setItem('accessibilitySwitch', 'true') : localStorage.removeItem('accessibilitySwitch')
      const choiveViaTog = localStorage.getItem('accessibilitySwitch') !== null && localStorage.getItem('accessibilitySwitch') === 'true'
      if (choiveViaTog) {
        _fireAccessFunctions(true, false)
      }else{
        _fireAccessFunctions(false, false)
      }
    })
    if (choiceViaLS) {
      _fireAccessFunctions(true, true)
    }
  }
}