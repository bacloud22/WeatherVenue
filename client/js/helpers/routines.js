/* eslint-disable no-unused-vars */

import { LIS } from "./lis.js"
import { state } from '../state.js'
import { generateCard } from './generateCard.js'

const ops = {}
const conf = {}

function __class(cls) {
    return document.getElementsByClassName(cls)
}

let collapseBtn1 = LIS.id('collapse1')
collapseBtn1.onclick = function () {
    collapseBtn1.classList.toggle('active')
}
let collapseBtn2 = LIS.id('collapse2')
collapseBtn2.onclick = function () {
    collapseBtn2.classList.toggle('active')
}

// less styling, setting business positions off and transit off
const styles = {
    default: [],
    hide: [
        {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
        },
        {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
        },
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
    night: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }],
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }],
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }],
        },
        {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
        },
        {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
        },
    ],
}
// Copyright of PimpTrizkit taken from https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
// Version 4.0
function pSBC(p, c0, c1, l) {
    let r,
        g,
        b,
        P,
        f,
        t,
        h,
        i = parseInt,
        m = Math.round,
        a = typeof c1 == 'string'
    if (
        typeof p != 'number' ||
        p < -1 ||
        p > 1 ||
        typeof c0 != 'string' ||
        (c0[0] != 'r' && c0[0] != '#') ||
        (c1 && !a)
    )
        return null
    if (!this.pSBCr)
        this.pSBCr = (d) => {
            let n = d.length,
                x = {}
            if (n > 9) {
                ;([r, g, b, a] = d = d.split(',')), (n = d.length)
                if (n < 3 || n > 4) return null
                ;(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))),
                    (x.g = i(g)),
                    (x.b = i(b)),
                    (x.a = a ? parseFloat(a) : -1)
            } else {
                if (n == 8 || n == 6 || n < 4) return null
                if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '')
                d = i(d.slice(1), 16)
                if (n == 9 || n == 5)
                    (x.r = (d >> 24) & 255),
                        (x.g = (d >> 16) & 255),
                        (x.b = (d >> 8) & 255),
                        (x.a = m((d & 255) / 0.255) / 1000)
                else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1)
            }
            return x
        }
    ;(h = c0.length > 9),
        (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
        (f = this.pSBCr(c0)),
        (P = p < 0),
        (t =
            c1 && c1 != 'c'
                ? this.pSBCr(c1)
                : P
                ? { r: 0, g: 0, b: 0, a: -1 }
                : { r: 255, g: 255, b: 255, a: -1 }),
        (p = P ? p * -1 : p),
        (P = 1 - p)
    if (!f || !t) return null
    if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b))
    else
        (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
            (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
            (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5))
    ;(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0)
    if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')'
    else
        return (
            '#' +
            (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0))
                .toString(16)
                .slice(1, f ? undefined : -2)
        )
}

var cardsColors
ops['styleItDark'] = () => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-bs-theme', 'dark');

    state.map.setOptions({ styles: styles.night })
    LIS.id('copyright_google').src = '/images/powered_by_google_on_non_white_hdpi.png'
    if (!cardsColors) {
        cardsColors = Array.from(__class('card')).map((card) => {
            return card.style.backgroundColor
        })
        cardsColors = [...cardsColors]
    }

    Array.from(__class('card')).forEach((card) => {
        card.style.backgroundColor = pSBC(-0.2, card.style.backgroundColor)
    })

    LIS.id('logo').src = '/images/weather_venue_856-8_on_black.png'

    localStorage.setItem('darkSwitch', 'dark')
}

ops['styleItWhite'] = () => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-bs-theme', 'light');

    state.map.setOptions({ styles: styles.hide })
    LIS.id('copyright_google').src = '/images/powered_by_google_on_white_hdpi.png'
    if (cardsColors) {
        Array.from(__class('card')).forEach(function (card, idx) {
            card.style.backgroundColor = cardsColors[idx]
        })
    }
    LIS.id('logo').src = '/images/weather_venue_856-8.png'
    localStorage.setItem('darkSwitch', null)
}

ops['showLoading'] = () => {
    LIS.id('spinner-back').classList.add('show')
    LIS.id('spinner-front').classList.add('show')
}

ops['hideLoading'] = () => {
    LIS.id('spinner-back').classList.remove('show')
    LIS.id('spinner-front').classList.remove('show')
}

ops['setWithExpiry'] = (key, value) => {
    const now = new Date()
    const day = {
        day: now.getDay(),
        month: now.getMonth(),
        year: now.getFullYear()
    }

    // `item` is an object which contains the original value
    // as well as today's date
    const item = {
        value: value,
        expiry: day,
    }
    localStorage.setItem(key, JSON.stringify(item))
}

ops['getWithExpiry'] = (key) => {
    const itemStr = localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }
    const item = JSON.parse(itemStr)
    const now = new Date()

    // compare the expiry time of the item with the current time
    if (
        now.getDay() !== item.expiry.day ||
        now.getMonth() !== item.expiry.month ||
        now.getFullYear() !== item.expiry.year
    ) {
        // If the item generated today, delete the item from storage
        // and return null
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

ops['themeSwitch'] = () => {
    const isChecked = LIS.id('themeSwitch').checked
    const value = isChecked ? 1 : 0
    value ? localStorage.setItem('themeSwitch', 'true') : localStorage.removeItem('themeSwitch')
    if (!value) {
        document.body.style.backgroundImage = ''
        document.documentElement.style.backgroundImage = ''
    }
}


conf['autocompleteOptions'] = {
    types: ['(cities)'],
    // componentRestrictions: {country: "us"}
}

// Toggle cards background color between minimum and maximum hue colors
ops['minMax'] = () => {
    const cards = Array.from(document.querySelectorAll('[id^="checkIdcity"]'))
        .map((a) => {
            return a.firstElementChild
        })
        .filter((a) => {
            return a.className === 'card'
        })
        .slice(0, 8)
    cards.forEach((card) => {
        const style = card.style.backgroundImage
        if (style.indexOf('40%') > -1) {
            LIS.id('minmax').children[0].style = 'color:blue'
            LIS.id('minmax').children[1].style = 'color:black'
            card.style.backgroundImage = style.replace('40%', '100%').replace('40%', '100%')
            Array.from(document.body.getElementsByTagName('th'))
                .slice(0, 176)
                .forEach((th) => {
                    th.innerHTML = th.innerHTML.replace('ᐁ', '▼')
                    th.innerHTML = th.innerHTML.replace('▲', 'ᐃ')
                })
            return
        }
        if (style.indexOf('0.01%') > -1) {
            LIS.id('minmax').children[0].style = 'color:black'
            LIS.id('minmax').children[1].style = 'color:black'
            card.style.backgroundImage = style.replace('0.01%', '40%').replace('0.01%', '40%')
            Array.from(document.body.getElementsByTagName('th'))
                .slice(0, 176)
                .forEach((th) => {
                    th.innerHTML = th.innerHTML.replace('▼', 'ᐁ')
                    th.innerHTML = th.innerHTML.replace('▲', 'ᐃ')
                })
            return
        }
        if (style.indexOf('100%') > -1) {
            LIS.id('minmax').children[0].style = 'color:black'
            LIS.id('minmax').children[1].style = 'color:red'
            card.style.backgroundImage = style.replace('100%', '0.01%').replace('100%', '0.01%')
            Array.from(document.body.getElementsByTagName('th'))
                .slice(0, 176)
                .forEach((th) => {
                    th.innerHTML = th.innerHTML.replace('▼', 'ᐁ')
                    th.innerHTML = th.innerHTML.replace('ᐃ', '▲')
                })
        }
    })
}

// Comparison
ops['allowDrop'] = (ev) => {
    ev.preventDefault()
}

ops['drag'] = (ev) => {
    ev.dataTransfer.setData('text', ev.target.id)
}

ops['drop'] = (ev) => {
    ev.preventDefault()
    const data = ev.dataTransfer.getData('text')
    const toBe = generateCard(data)
    ev.target.appendChild(toBe)
}

ops['autoDrag'] = (autoDragId) => {
    LIS.id(autoDragId).remove()
    const data = autoDragId.slice(0, -9)
    const toBe = generateCard(data)
    toBe.childNodes[4].remove()
    LIS.id('comparision-items').appendChild(toBe)
    window.location = '#comparision-items'
}

ops['emptyIt'] = () => {
    const elements = document.querySelectorAll('[id*="_clone"]')
    Array.prototype.forEach.call(elements, function (node) {
        node.parentNode.removeChild(node)
    })
}

// TODO: attach these function to their respective dom elements
window.allowDrop = ops['allowDrop']
window.drag = ops['drag']
window.drop = ops['drop']
window.autoDrag = ops['autoDrag']
window.emptyIt = ops['emptyIt']

export { ops, conf }
