import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import NewsCard from '../components/NewsCard.astro';

test("Renderiza el título, fecha y pre-título correctamente", async () => {
    const container = await AstroContainer.create();
    // Renderizamos el componente con datos de prueba
    const result = await container.renderToString(NewsCard, {
        props: { 
            id: 1,
            title: "Gran Noticia",
            pretitle: "Última hora",
            date: "10 de Octubre",
            image: "https://ejemplo.com/foto.jpg"
        }
    });

    expect(result).toContain("Gran Noticia");
    expect(result).toContain("Última hora");
    expect(result).toContain("10 de Octubre");
});

test("Renderiza la imagen correctamente si se proporciona una URL", async () => {
    const container = await AstroContainer.create();
    const testImage = "https://ejemplo.com/foto.jpg";

    const result = await container.renderToString(NewsCard, {
        props: { 
            id: 2,
            title: "Noticia con foto",
            pretitle: "",
            date: "Hoy",
            image: testImage
        }
    });

    // Buscamos que el src de la imagen esté presente
    expect(result).toContain(`src="${testImage}"`);
    expect(result).toContain('alt="Noticia con foto"');
});

test("Muestra 'Sin imagen' cuando la propiedad image está vacía", async () => {
    const container = await AstroContainer.create();

    const result = await container.renderToString(NewsCard, {
        props: { 
            id: 3,
            title: "Noticia sin foto",
            pretitle: "",
            date: "Ayer",
            image: "" 
        }
    });

    expect(result).not.toContain('<img');
    
    expect(result).toContain('Sin imagen');
});

test("Genera el enlace (href) correcto basado en el ID", async () => {
    const container = await AstroContainer.create();
    const testId = 123;

    const result = await container.renderToString(NewsCard, {
        props: { 
            id: testId,
            title: "Click aquí",
            pretitle: "",
            date: "2024",
            image: ""
        }
    });

    expect(result).toContain(`href="/noticias/${testId}"`);
});