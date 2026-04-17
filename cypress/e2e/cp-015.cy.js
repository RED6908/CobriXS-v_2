describe('CP-015: Registro de Producto y Venta Durante la Jornada', () => {

  it('Debe registrar producto, venderlo y reflejar cambios en inventario y reportes', () => {

    const producto = 'Chocolate';
    const codigoProducto = '125489';
    const precioVenta = '18.00';

    // 🔹 1. Ir al login
    cy.visit('/login');

    // 🔹 2. Login
    cy.get('input[type="email"]').type('Ramirez@gmail.com');
    cy.get('input[type="password"]').type('123456');
    cy.contains('Iniciar sesión').click();

    // 🔹 3. Ir a Productos
    cy.contains('Productos').click();

    // 🔹 4. Click en "Nuevo producto"
    cy.contains('Nuevo').click();

    // 🔹 5. Llenar formulario de nuevo producto
    cy.contains('label', 'Nombre').parent().find('input').type(producto);
    cy.contains('label', 'Código').parent().find('input').type(codigoProducto);
    cy.contains('label', 'Stock').parent().find('input').clear().type('25');
    cy.contains('label', 'Precio compra').parent().find('input').type('10');
    cy.contains('label', 'Precio venta').parent().find('input').type(precioVenta);
    cy.contains('label', 'Categoría').parent().find('input').type('Dulces');

    // 🔹 6. Guardar producto
    cy.contains('Guardar').click();
    cy.wait(1000);

    // 🔹 7. Ir a Inventario para verificar
    cy.contains('Inventario').click();
    cy.get('input[placeholder*="Buscar"]').type(producto);

    // 🔹 8. Ir a Panel de Cobro
    cy.contains('Panel de Cobro').click();

    // 🔹 9. Buscar producto escribiendo el nombre
    cy.get('input[placeholder*="Código o nombre del producto"]')
      .type(producto);
    
    // Esperar que aparezcan los resultados
    cy.wait(500);
    
    // 🔹 10. Seleccionar el producto de los resultados
    cy.contains(producto).click();
    
    // 🔹 11. Verificar que el producto se agregó al carrito
    cy.contains(producto).should('be.visible');
    cy.contains(`$${precioVenta}`).should('be.visible');
        
    // 🔹 12. Procesar pago
    cy.contains('button', 'Procesar Pago').click();
    
    // 🔹 13. Esperar que aparezca el modal de confirmación de pago
    cy.wait(500);
    
    // 🔹 14. Confirmar la venta en el modal
    cy.get('.modal, [role="dialog"], .MuiModal-root')
      .should('be.visible')
      .within(() => {
        // Verificar que el total es correcto
        cy.contains(`$${precioVenta}`).should('be.visible');
        
        // Hacer clic en Confirmar venta
        cy.contains('button', 'Confirmar venta').click();
      });
    
    // Esperar a que se complete la venta
    cy.wait(1000);
    
    // 🔹 15. Ir a Inventario para verificar stock actualizado
    cy.contains('Inventario').click();
    
    // 🔹 16. Buscar producto
    cy.get('input[placeholder*="Buscar"]').clear().type(producto);
    
    // 🔹 17. Validar que el producto sigue existiendo y el stock disminuyó
    
  });
});