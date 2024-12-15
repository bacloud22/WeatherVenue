import axios from 'axios';
// import pkg from 'axios-cache-adapter';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
// import { fakeApiResponse } from '../consts/fakeOneCallApiResponse.js';
// const { setupCache } = pkg;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rawdata = zlib.gunzipSync(fs.readFileSync(path.join(__dirname, '../../data/geo/city.list.min.json.gz'))).toString()
const citiesIds = JSON.parse(rawdata)

// const cache = setupCache({
//   maxAge: 24 * 60 * 3
// })
// const api = axios.create({
//   adapter: cache.adapter
// })
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY

function getCityId(coord) {
  // return undefined;
  const toPrecision = x => Number.parseFloat(x).toPrecision(3)
  coord.lon = toPrecision(coord.lon)
  coord.lat = toPrecision(coord.lat)
  const onecity = citiesIds.filter((item) => {
    const lon = toPrecision(item.coord.lon)
    const lat = toPrecision(item.coord.lat)
    return lon === coord.lon && lat === coord.lat
  })[0]
  if (onecity) {
    return onecity.id
  } else {
    // console.log("getCityId called: \n city not found :(")
    return undefined
  }
}

async function fetchWeather0(westLng, northLat, eastLng, southLat, mapZoom) {
  return new Promise(async (resolve, reject) => {
    const openWeatherMapAPI = `https://api.openweathermap.org/data/2.5/box/city?bbox=${westLng},${northLat},${eastLng},${southLat},${mapZoom}&cluster=yes&format=json&APPID=${OPENWEATHERMAP_API_KEY}`
    // const body0 = await api({ url: openWeatherMapAPI, method: 'get' })
    const body0 = await axios.get(openWeatherMapAPI)
    resolve(body0)
  })
}

async function fetchWeather(city, language) {
  return new Promise(async (resolve, reject) => {
    const APIUrlWeather = `https://api.openweathermap.org/data/3.0/onecall?lat=${city.latitude}&lon=${city.longitude}&lang=${language}&exclude=hourly,minutely&units=metric&appid=${OPENWEATHERMAP_API_KEY}`
    // const body0 = await api({ url: APIUrlWeather, method: 'get' })
    const body0 = await axios.get(APIUrlWeather)
    const data0 = await body0.data
    const APIUrlPollution = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.latitude}&lon=${city.longitude}&appid=${OPENWEATHERMAP_API_KEY}`
    // const body1 = await api({ url: APIUrlPollution, method: 'get' })
    const body1 = await axios.get(APIUrlPollution)
    const data1 = await body1.data
    resolve({ weather: data0, pollution: data1 })

    // resolve({ weather: fakeApiResponse})
  })
}

function formatCities(cities, weathers, pollutions) {
  const newVar = {
    type: 'FeatureCollection',
    features: [],
    weather: [],
    pollution: []
  }
  cities.forEach(function (city, index) {
    const feature = {
      cityid: getCityId({ lon: city["lon"], lat: city["lat"] }),
      geometry: {
        type: 'Point',
        coordinates: [city.longitude, city.latitude]
      },
      type: 'Feature',
      properties: {
        category: 'Town',
        hours: '--',
        description: '--',
        name: city.name,
        phone: '--',
        place_id: '011101101'
      }
    }
    newVar.features.push(feature)
    weathers[index].cityName = city.name
    pollutions[index].cityName = city.name
  })

  newVar.weather = weathers
  newVar.pollution = pollutions
  return newVar
}

const messages = {
  notFoundMessages: {
    en: {
      h1: 'Oops!',
      h2: 'Page is not found',
      details: 'Sorry, an error has occurred or the requested page is not found.',
      actions: 'Take me home'
    },
    ar: {
      h1: 'أوه!',
      h2: 'الصفحة غير موجودة',
      details: 'عذراً ، الصفحة التي تبحث عنها غير موجودة',
      actions: 'الصفحة الرئيسة'
    },
    fr: {
      h1: 'Oops!',
      h2: 'Page non retrouvée',
      details: 'Désolé, une erreur est survenue ou la page demandée est introuvable.',
      actions: 'Page d\'accueil'
    }
  },
  tour: {
    en: {
      map: '"Interact with the map. You can click on markers and see each city weather cards. Right click on two markers to reveal a directions link. Also drag days control to see how tempreture will be in the next days."',
      cards: '"You can drag cards to the weather comparisons area. Colored cards reflect maximum and minimum temperature in one day. Click on min-max to simplify comparisions visually."',
      comparision: '"In comparison area You can see cards of different days and of different cities too. For Android devices and on Google Chrome only, You can also share any card with people."',
      gallery: '"A beautiful local gallery of pictures of the main city."'
    },
    ar: {
      map: '"تفاعل مع الخريطة. يمكنك النقر فوق العلامات ورؤية بطاقات الطقس الخاصة بكل مدينة. انقر بزر الماوس الأيمن على علامتين للكشف عن رابط الاتجاهات. اسحب أيضًا زر الأيام لترى كيف تقلبات درجة الحرارة في الأيام القادمة."',
      cards: '"يمكنك سحب البطاقات إلى منطقة مقارنة الطقس. تعكس البطاقات الملونة درجة الحرارة القصوى والدنيا في يوم واحد. انقر فوق min-max لتبسيط المقارنات بصريًا."',
      comparision: '"في منطقة المقارنة ، يمكنك رؤية بطاقات أيام مختلفة ومدن مختلفة أيضًا. بالنسبة لأجهزة Android وعلى Google Chrome فقط ، يمكنك أيضًا مشاركة أي بطاقة مع الأشخاص."',
      gallery: '"عرض جميل لصور المدينة الرئيسية."'
    },
    fr: {
      map: '"Interagissez avec la carte. Vous pouvez cliquer sur les marqueurs et voir les cartes météo de chaque ville. Faites un clic droit sur deux marqueurs pour révéler un lien de directions. Faites également glisser le «controleur des jours» pour voir comment la température sera dans les prochains jours. "',
      cards: '"Vous pouvez glisser des cartes vers la zone de comparaison. Les cartes colorées reflètent la température maximale et minimale en une journée. Cliquez sur min-max pour simplifier visuellement les comparaisons."',
      comparision: '"Dans la zone de comparaison Vous pouvez voir des cartes de différents jours et de différentes villes aussi. Pour les appareils Android et sur Google Chrome uniquement, vous pouvez également partager n importe quelle carte avec d autres personnes."',
      gallery: '"Une belle galerie locale de photos de la ville principale."'
    }
  },
  index: {
    en: {
      explanatory: 'Find the best places to visit near you; for warmer winter holidays or cool summer getaways.',
      location: 'Enter your city to get the forecast',
      comparision: 'Weather comparison',
      gallery: 'Local images of the main city will appear below'
    },
    ar: {
      explanatory: 'ابحث عن أفضل الأماكن التي يمكنك زيارتها في محيطك؛ لقضاء عطلات الشتاء الدافئة أو عطلات الصيف الباردة.',
      location: 'أدخل مدينتك للحصول على التوقعات',
      comparision: 'مقارنة الطقس',
      gallery: 'ستظهر الصور المحلية للمدينة الرئيسية أدناه'
    },
    fr: {
      explanatory: 'Retrouver les meilleurs endroits à visiter dans votre entourage ; Pour des vacances hivernales plus chaudes ou des escapades estivales fraîches.',
      location: 'Entrer votre ville pour avoir les prévisions',
      comparision: 'Comparaison météo',
      gallery: 'Des images locales de la ville principale apparaîtront ci-dessous'
    }
  }
}

export { messages, getCityId, fetchWeather, fetchWeather0, formatCities };

