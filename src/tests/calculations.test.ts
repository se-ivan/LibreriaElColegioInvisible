import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '../src/utils/bookHelpers';

describe('Pruebas de Cálculos Financieros', () => {

    it('Debe aplicar el descuento correctamente', () => {
        // $100 - 20% = $80
        expect(calculateDiscount(100, 20)).toBe(80);
        // $50 - 50% = $25
        expect(calculateDiscount(50, 50)).toBe(25);
    });

    it('Debe manejar el 0% de descuento', () => {
        expect(calculateDiscount(200, 0)).toBe(200);
    });

    it('Debe manejar el 100% de descuento (gratis)', () => {
        expect(calculateDiscount(50, 100)).toBe(0);
    });

    it('No debe aplicar descuentos negativos (debe devolver precio original)', () => {
        expect(calculateDiscount(100, -10)).toBe(100);
    });

    it('No debe aplicar descuentos mayores al 100% (debe devolver precio original)', () => {
        expect(calculateDiscount(100, 150)).toBe(100);
    });

});