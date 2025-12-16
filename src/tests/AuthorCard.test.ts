import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AuthorCard from '../components/AuthorCard.astro';

// Datos de prueba para un autor famoso
const testProps = {
    id: 42,
    name: "Jane Austen",
    nationality: "Británica",
    genre: "Novela Romántica",
    imageUrl: "https://ejemplo.com/jane_austen.jpg",
    totalBooks: 6,
};

test("Renderiza la información básica del autor correctamente", async () => {
    const container = await AstroContainer.create();
    
    // Renderizamos el componente con los datos de prueba
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

    // 1. Verificar el nombre del autor
    expect(result).toContain(testProps.name); 
    
    // 2. Verificar la nacionalidad
    expect(result).toContain(testProps.nationality); 
    
    // 3. Verificar el género
    expect(result).toContain(testProps.genre); 
    
    // 4. Verificar el contador de libros
    expect(result).toContain(`Libros publicados: ${testProps.totalBooks}`);
});

test("Renderiza la imagen del autor con la URL y el alt text correctos", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

    // 1. Verificar el atributo 'src'
    expect(result).toContain(`src="${testProps.imageUrl}"`);
    
    // 2. Verificar el 'alt' text usando el nombre (por accesibilidad)
    expect(result).toContain(`alt="Foto de ${testProps.name}"`);
});

test("Genera el enlace (href) correcto para 'Ver Perfil'", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

    // Verificar que el 'a' tag apunte a la ruta dinámica correcta (/autores/{id})
    expect(result).toContain(`href="/autores/${testProps.id}"`);
    
    // Verificar que el texto del enlace esté presente
    expect(result).toContain("Ver Perfil");
});

test("Asegura la presencia de clases de Tailwind CSS para estilos clave", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });
    
    // Verificamos algunas clases de estilo cruciales para el diseño
    expect(result).toContain('bg-[#f9fcfe]'); // Fondo
    expect(result).toContain('shadow-md');    // Sombra
    expect(result).toContain('hover:scale-[1.02]'); // Efecto hover
    expect(result).toContain('bg-blue-100'); // Estilo del badge de nacionalidad
});