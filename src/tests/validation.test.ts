import { describe, it, expect } from 'vitest';
import { validateBookInput } from '../src/utils/bookHelpers';

describe('Pruebas de Validación de Datos', () => {

    it('Debe aceptar un libro con todos los datos correctos', () => {
        const libroValido = { title: "Dune", isbn: "978-123", price: 25.50 };
        const resultado = validateBookInput(libroValido);
        
        expect(resultado.valid).toBe(true);
        expect(resultado.error).toBeNull();
    });

    it('Debe rechazar libros sin título', () => {
        const sinTitulo = { title: "", isbn: "978-123", price: 20 };
        const resultado = validateBookInput(sinTitulo);

        expect(resultado.valid).toBe(false);
        expect(resultado.error).toMatch(/título es obligatorio/i);
    });

    it('Debe rechazar ISBNs demasiado cortos', () => {
        const isbnCorto = { title: "Libro", isbn: "1", price: 20 };
        const resultado = validateBookInput(isbnCorto);

        expect(resultado.valid).toBe(false);
        expect(resultado.error).toMatch(/ISBN inválido/i);
    });

    it('Debe rechazar precios negativos', () => {
        const precioNegativo = { title: "Libro", isbn: "978-123", price: -10 };
        const resultado = validateBookInput(precioNegativo);

        expect(resultado.valid).toBe(false);
        expect(resultado.error).toMatch(/precio no puede ser negativo/i);
    });

});