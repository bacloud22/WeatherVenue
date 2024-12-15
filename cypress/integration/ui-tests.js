const BASE_URL = 'localhost:3000'

function test_on_device (size, landscape, test_function) {
  /**
     * Test test_function on specified device
     * @param  size  Name of device or width and height of device
     * as a array with length of two
     * @param  landscape  True if you want to test on landscape
     * @param  test_function  Test function
     */
  if (Cypress._.isArray(size)) {
    cy.viewport(size[0], size[1])
    test_function()
  } else if (landscape) {
    cy.viewport(size, 'landscape')
    test_function()
  } else {
    cy.viewport(size)
    test_function()
  }
}

function test_on_all_devices (test_function) {
  /**
     * Test test_function on some mobile devices
     * @param  test_function  Test function
     */
  const sizes = [
    'ipad-2',
    'ipad-mini',
    'iphone-3',
    'iphone-4',
    'iphone-5',
    'iphone-6',
    'iphone-6+',
    'iphone-7',
    'iphone-8',
    'iphone-x',
    'iphone-xr',
    'iphone-se2',
    'macbook-11',
    'macbook-13',
    'macbook-15',
    'macbook-16',
    [1600, 900],
    [1920, 1080]
  ]
  sizes.forEach((size) => {
    test_on_device(size, false, test_function)
    test_on_device(size, true, test_function)
  })
}

function test_on_mobile (test_function, landscape = false) {
  /**
     * Test test_function on some mobile resolution
     * @param  test_function  Test function
     * @param  landscape  Make device landscape if `landscape` is true
     */
  const sizes = [
    'ipad-2',
    'ipad-mini',
    'iphone-3',
    'iphone-4',
    'iphone-5',
    'iphone-6',
    'iphone-6+',
    'iphone-7',
    'iphone-8',
    'iphone-x',
    'iphone-xr',
    'iphone-se2',
    'samsung-note9',
    'samsung-s10'
  ]
  sizes.forEach((size) => {
    test_on_device(size, landscape, test_function)
  })
}
function test_on_desktop (test_function) {
  /**
     * Test test_function on some desktop resolution
     * @param  test_function  Test function
     */
  const sizes = [
    'macbook-11',
    'macbook-13',
    'macbook-15',
    'macbook-16',
    [1600, 900],
    [1920, 1080]
  ]
  sizes.forEach((size) => {
    test_on_device(size, false, test_function)
  })
}

describe('Sanity', function () {
  function sanity () {
    cy.visit(BASE_URL)
  }
  it('Sanity', () => { test_on_all_devices(sanity) })
})

describe('Nav', function () {
  function click_nav_bar_on_mobile () {
    cy.get('body > nav.navbar.navbar-expand-lg.py-0 > button').click()
  }

  function functionalities (is_mobile) {
    cy.visit(BASE_URL)
    cy.get('#exampleModal2').should('not.be.visible')
    if (is_mobile) { click_nav_bar_on_mobile() }
    cy.get('#navbar > ul.navbar-nav > li:nth-child(1) > a').click()
    cy.get('#exampleModal2').should('be.visible')
  }
  it('Functionalities-Desktop', () => {
    test_on_desktop(
      () => { functionalities(false) }
    )
  })
  it('Functionalities-Mobile', () => {
    test_on_mobile(
      () => { functionalities(true) }, false
    )
  })

  it('Functionalities-Mobile-Landescape', () => {
    test_on_mobile(
      () => { functionalities(false) }, true
    )
  })

  function tour (is_mobile) {
    cy.visit(BASE_URL)
    if (is_mobile) {
      click_nav_bar_on_mobile()
    }
    cy.get('.nav-link').eq(1).click()
    cy.get('.introjs-overlay')
    cy.get('.introjs-helperLayer')
    cy.get('.introjs-tooltipReferenceLayer')
    cy.get('.introjs-floating')
    cy.get('.introjs-tooltiptext').should('be.visible')
    cy.get('.introjs-bullets')
    cy.get('.introjs-progress')
    cy.get('.introjs-arrow')
    cy.get('.introjs-tooltipbuttons')
    /// todo just clicking on buttons is not enough :)
    function nxt () {
      cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton').click()
    }
    function prv () {
      cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-prevbutton').click()
    }
    cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-prevbutton.introjs-disabled').should('have.class', 'introjs-disabled')
    cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton').should('have.class', 'introjs-nextbutton')
    nxt(); nxt(); nxt()
    cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton.introjs-donebutton').click()

    cy.get('.nav-link').eq(1).click()
    cy.get('.introjs-overlay')
    cy.get('.introjs-helperLayer')
    cy.get('.introjs-tooltipReferenceLayer')
    cy.get('.introjs-floating')
    cy.get('.introjs-tooltiptext').should('be.visible')
    cy.get('.introjs-bullets')
    cy.get('.introjs-progress')
    cy.get('.introjs-arrow')
    cy.get('.introjs-tooltipbuttons')
    nxt(); prv()
    nxt(); nxt(); prv(); prv()
    nxt()
    nxt(); prv()
    nxt()
    nxt(); prv()
    nxt()
    cy.get('body > div.introjs-tooltipReferenceLayer > div > div.introjs-tooltipbuttons > a.introjs-button.introjs-nextbutton.introjs-donebutton').click()
  }

  it('Tour-Desktop', () => {
    test_on_desktop(
      () => { tour(false) }
    )
  })
  it('Tour-Mobile', () => {
    test_on_mobile(
      () => { tour(true) }, false
    )
  })

  it('Tour-Mobile-Landescape', () => {
    test_on_mobile(
      () => { tour(false) }, true
    )
  })

  function disclaimer (is_mobile) {
    cy.visit(BASE_URL)
    if (is_mobile) {
      click_nav_bar_on_mobile()
    }
    cy.get('#exampleModal').should('not.be.visible')
    cy.get('#navbar > ul.navbar-nav > li:nth-child(6) > a').click()
    cy.get('#exampleModal').should('be.visible')
  }

  it('Disclaimer-Desktop', () => {
    test_on_desktop(
      () => { disclaimer(false) }
    )
  })
  it('Disclaimer-Mobile', () => {
    test_on_mobile(
      () => { disclaimer(true) }, false
    )
  })

  it('Disclaimer-Mobile-Landescape', () => {
    test_on_mobile(
      () => { disclaimer(false) }, true
    )
  })
})

// describe('Map', function () {

//     function search() {
//         cy.visit(BASE_URL);
//         cy.get("#pac-input").type('Tehran');
//         cy.get("#pac-input").type('{enter}');
//         cy.wait(1000);
//         cy.get("#pac-input").type('{downarrow}');
//         cy.get("#pac-input").type('{enter}');
//         cy.get("#location").should(
//             "have.text",
//             "Tehrān"
//           );
//     }
//     it('Search', () => {test_on_all_devices(search)});
// });

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes("Cannot read properties of null (reading 'dataset')")) {
    return false
  }
  return true
})
