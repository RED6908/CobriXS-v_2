describe('CP-012: Registro de Venta Durante la Jornada', () => {

  it('Debe registrar una venta y reflejar cambios en inventario y dashboard', () => {

    const producto = 'Coca cola 1L';

    // 🔹 1. Ir al login
    cy.visit('/login');

    // 🔹 2. Login
    cy.get('input[type="email"]').type('Ramirez@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.contains('Iniciar sesión').click();

    // 🔹 3. Esperar redirección
    cy.url().should('include', '/');

    // 🔹 4. Ir a Panel de Cobro (IMPORTANTE)
    cy.contains('Panel de Cobro').click();

    // 🔹 5. Validar que sí estamos en POS
    cy.url().should('include', '/pos');

    // 🔹 6. Esperar input de búsqueda
    cy.get('input[placeholder*="producto"]', { timeout: 10000 })
      .should('be.visible')
      .type(producto);

    // 🔹 7. Seleccionar producto
    cy.contains(producto, { timeout: 10000 }).click();

    // 🔹 8. Procesar pago
    cy.contains('Procesar Pago').click();

    // 🔹 9. Confirmar venta (modal)
    cy.contains('Confirmar venta', { timeout: 10000 }).click();

    // 🔹 11. Ir a Dashboard
    cy.contains('Inicio').click();

    // 🔹 12. Validar ventas del día
    cy.contains('Ventas hoy').should('be.visible');

    // 🔹 13. Validar ventas recientes
    cy.contains('Ventas recientes').should('be.visible');

  });

});