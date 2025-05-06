describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the correct title', () => {
    cy.title().should('contain', 'Colors of Life');
  });

  it('should navigate to the signup page', () => {
    cy.get('a').contains(/sign up/i).click();
    cy.url().should('include', '/signup');
  });

  it('should have working primary CTA button', () => {
    cy.get('button').contains(/get started/i).click();
    cy.url().should('include', '/onboarding');
  });

  it('should display the main hero section', () => {
    cy.get('h1').should('be.visible');
    cy.get('h1').should('contain', 'fashion');
  });
}); 