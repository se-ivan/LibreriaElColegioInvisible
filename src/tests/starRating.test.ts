import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import StarRating from '../components/StarRating.astro';

test("Renderiza el aria-label correcto y score perfecto", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(StarRating, {
        props: { score: 5 }
    });

    expect(result).toContain('aria-label="Calificación de 5 sobre 5"');

    expect(result).not.toContain('text-gray-300');
    
    expect(result).not.toContain('id="half-grad"');
});

test("Renderiza medias estrellas correctamente (3.5)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(StarRating, {
        props: { score: 3.5 }
    });

    expect(result).toContain('aria-label="Calificación de 3.5 sobre 5"');

    expect(result).toContain('id="half-grad"');
    
    expect(result).toContain('text-gray-300');
});

test("Renderiza estrellas vacías (Score 0)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(StarRating, {
        props: { score: 0 }
    });

    const emptyStarsCount = (result.match(/text-gray-300/g) || []).length;
    
    expect(emptyStarsCount).toBe(5);
    expect(result).toContain('aria-label="Calificación de 0 sobre 5"');
});
