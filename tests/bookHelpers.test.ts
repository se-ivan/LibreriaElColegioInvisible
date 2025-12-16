import { describe, it, expect } from 'vitest';
import { formatPrice, validateBookInput } from '../src/utils/bookHelpers';

describe('Pruebas del Catálogo de Libros', () => {

    it('Debe formatear correctamente los precios a 2 decimales', () => {
        expect(formatPrice(20)).toBe('$20.00');
        
        expect(formatPrice(19.999)).toBe('$20.00');
        
        expect(formatPrice("15.5")).toBe('$15.50');
        
        expect(formatPrice("hola")).toBe('$0.00');
    });
    it('Debe rechazar libros con datos incorrectos', () => {
        const libroSinTitulo = { title: "", isbn: "123", price: 10 };
        const resultado1 = validateBookInput(libroSinTitulo);
        expect(resultado1.valid).toBe(false);
        expect(resultado1.error).toBe("El título es obligatorio");
        const libroPrecioNegativo = { title: "Dune", isbn: "123", price: -5 };
        const resultado2 = validateBookInput(libroPrecioNegativo);
        expect(resultado2.valid).toBe(false);
        expect(resultado2.error).toBe("El precio no puede ser negativo");
        const libroBueno = { title: "Dune", isbn: "999-999", price: 25.50 };
        const resultado3 = validateBookInput(libroBueno);
        expect(resultado3.valid).toBe(true);
    });

});