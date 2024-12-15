const BASE_URL = 'http://localhost:3000';

function test_on_device(size, landscape, test_function) {
  /**
   * Test test_function on specified device
   * @param size Name of device or width and height of device
   * as an array with length of two
   * @param landscape True if you want to test on landscape
   * @param test_function Test function
   */
  if (Cypress._.isArray(size)) {
    cy.viewport(size[0], size[1]);
  } else {
    cy.viewport(size, landscape ? 'landscape' : 'portrait');
  }
  test_function();
}

function test_on_all_devices(test_function) {
  /**
   * Test test_function on some mobile and desktop devices
   * @param test_function Test function
   */
  const sizes = [
    'ipad-2',
    'ipad-mini',
    'iphone-x',
    'iphone-se2',
    'macbook-13',
    'macbook-16',
    [1600, 900],
    [1920, 1080]
  ];
  sizes.forEach((size) => {
    test_on_device(size, false, test_function);
    test_on_device(size, true, test_function);
  });
}

function test_on_mobile(test_function, landscape = false) {
  /**
   * Test test_function on mobile resolutions
   * @param test_function Test function
   * @param landscape Test in landscape mode if true
   */
  const sizes = ['iphone-x', 'iphone-se2', 'ipad-2', 'ipad-mini'];
  sizes.forEach((size) => {
    test_on_device(size, landscape, test_function);
  });
}

function test_on_desktop(test_function) {
  /**
   * Test test_function on desktop resolutions
   * @param test_function Test function
   */
  const sizes = ['macbook-13', 'macbook-16', [1600, 900], [1920, 1080]];
  sizes.forEach((size) => {
    test_on_device(size, false, test_function);
  });
}

// Sanity Tests
describe('Sanity', function () {
  it('should load successfully on all devices', () => {
    test_on_all_devices(() => {
      cy.visit(BASE_URL);
      cy.title().should('exist');
    });
  });
});

// Navigation Tests
describe('Nav', function () {
  function click_nav_bar_on_mobile() {
    cy.get('[data-cy="nav-toggle"]').should('exist').click();
  }

  function functionalities(is_mobile) {
    cy.visit(BASE_URL);
    cy.get('#exampleModal2').should('not.be.visible');
    if (is_mobile) {
      click_nav_bar_on_mobile();
    }
    cy.get('[data-cy="nav-item-1"]').should('be.visible').click();
    cy.get('#exampleModal2').should('be.visible');
  }

  it('Functionalities - Desktop', () => {
    test_on_desktop(() => functionalities(false));
  });

  it('Functionalities - Mobile', () => {
    test_on_mobile(() => functionalities(true));
  });

  it('Functionalities - Mobile (Landscape)', () => {
    test_on_mobile(() => functionalities(false), true);
  });

  function tour(is_mobile) {
    cy.visit(BASE_URL);
    if (is_mobile) {
      click_nav_bar_on_mobile();
    }
    cy.get('[data-cy="tour-button"]').should('exist').click();
    cy.get('.introjs-tooltiptext').should('be.visible');

    function next() {
      cy.get('[data-cy="intro-next"]').should('exist').click();
    }
    function prev() {
      cy.get('[data-cy="intro-prev"]').should('exist').click();
    }

    next();
    next();
    prev();
    next();
  }

  it('Tour - Desktop', () => {
    test_on_desktop(() => tour(false));
  });

  it('Tour - Mobile', () => {
    test_on_mobile(() => tour(true));
  });

  it('Tour - Mobile (Landscape)', () => {
    test_on_mobile(() => tour(false), true);
  });

  function disclaimer(is_mobile) {
    cy.visit(BASE_URL);
    if (is_mobile) {
      click_nav_bar_on_mobile();
    }
    cy.get('#exampleModal').should('not.be.visible');
    cy.get('[data-cy="nav-disclaimer"]').should('exist').click();
    cy.get('#exampleModal').should('be.visible');
  }

  it('Disclaimer - Desktop', () => {
    test_on_desktop(() => disclaimer(false));
  });

  it('Disclaimer - Mobile', () => {
    test_on_mobile(() => disclaimer(true));
  });

  it('Disclaimer - Mobile (Landscape)', () => {
    test_on_mobile(() => disclaimer(false), true);
  });
});

// Exception Handling
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null")) {
    return false;
  }
  return true;
});
