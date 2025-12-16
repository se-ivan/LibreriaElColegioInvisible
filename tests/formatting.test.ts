import { describe, it, expect } from 'vitest';
import { formatPrice, truncateText } from '../src/utils/bookHelpers';

describe('Pruebas de Formato y Presentación', () => {

    describe('formatPrice', () => {
        it('Debe agregar el signo de pesos y dos decimales', () => {
            expect(formatPrice(20)).toBe('$20.00');
            expect(formatPrice(0)).toBe('$0.00');
        });

        it('Debe redondear decimales correctamente', () => {
            expect(formatPrice(19.999)).toBe('$20.00');
            expect(formatPrice(10.5)).toBe('$10.50');
        });

        it('Debe manejar valores no numéricos devolviendo $0.00', () => {
            expect(formatPrice("texto")).toBe('$0.00');
            expect(formatPrice("")).toBe('$0.00');
        });
    });

    describe('truncateText', () => {
        it('Debe cortar textos que excedan el límite y agregar ...', () => {
            const texto = "En un lugar de la Mancha";
            expect(truncateText(texto, 10)).toBe("En un luga...");
        });

        it('No debe tocar textos que sean cortos', () => {
            expect(truncateText("Hola", 10)).toBe("Hola");
        });

        it('Debe manejar strings vacíos', () => {
            expect(truncateText("", 5)).toBe("");
        });
    });

});