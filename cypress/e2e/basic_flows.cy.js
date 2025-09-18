describe('NoteZ basic flows', () => {
  it('loads login page', () => {
    cy.visit('/login');
    cy.contains('Login').should('exist');
  });
});



