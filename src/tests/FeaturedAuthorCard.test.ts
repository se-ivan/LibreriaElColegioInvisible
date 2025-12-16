import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AutorDestac from '../components/AutorDestac.astro'; // Asumiendo que el nombre del archivo es FeaturedAuthorCard.astro

// --- DATOS DE PRUEBA ---

// 1. Autor con todos los campos (Nacionalidad definida)
const fullProps = {
    id: 101,
    name: "Virginia Woolf",
    nationality: "Británica",
    genre: "Modernismo",
    description: "Novelista, ensayista, escritora de cartas, editora y feminista británica, considerada una de las figuras más destacadas del modernismo anglosajón.",
    imageUrl: "https://ejemplo.com/virginia_woolf.jpg",
};

// 2. Autor con nacionalidad nula (Simulando un caso en la BD)
const partialProps = {
    id: 102,
    name: "Emily Dickinson",
    nationality: null, // Nacionalidad es nula en la DB
    genre: "Poesía",
    description: "Poetisa estadounidense cuya obra se publicó principalmente de forma póstuma.",
    imageUrl: "https://ejemplo.com/emily_dickinson.jpg",
};

// =========================================================
// TEST SUITE PRINCIPAL
// =========================================================

test("Renderiza el componente y sus datos básicos correctamente", async () => {
    const container = await AstroContainer.create();
    
    // Renderizamos el componente con todos los datos
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });

    // 1. Verifica el nombre y la descripción
    expect(result).toContain(fullProps.name); 
    expect(result).toContain(fullProps.description); 
    
    // 2. Verifica la imagen y su alt text
    expect(result).toContain(`src="${fullProps.imageUrl}"`);
    expect(result).toContain(`alt="Foto de ${fullProps.name}"`);
    
    // 3. Verifica el género y la nacionalidad combinados
    expect(result).toContain(`${fullProps.genre} | ${fullProps.nationality}`); 
    
    // 4. Verifica el título "Autor Destacado"
    expect(result).toContain("Autor Destacado");
});

test("Genera el enlace (href) correcto para 'Ver Perfil'", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });

    // La URL debe usar el ID para la ruta dinámica
    expect(result).toContain(`href="/autores/${fullProps.id}"`);
    expect(result).toContain("Ver Perfil");
});

test("Maneja la nacionalidad nula correctamente", async () => {
    const container = await AstroContainer.create();
    
    // Renderizamos con nacionalidad nula
    const result = await container.renderToString(AutorDestac, {
        props: partialProps
    });

    // Cuando nationality es null, el componente renderiza: {genre} | {nationality}
    // Si nationality es null, el resultado debería ser solo 'Poesía | '
    // O si Astro lo maneja automáticamente como una cadena vacía, solo 'Poesía |'
    
    // La prueba más segura es verificar que el género esté presente
    expect(result).toContain(partialProps.genre);
    
    // Y que la nacionalidad nula no genere un error visible (como 'null' o 'undefined')
    // Dependiendo de cómo Astro/TypeScript maneje la interpolación de `null`,
    // el resultado esperado es: `Poesía | `.
    // Por lo tanto, el output final debería contener el género y el separador.
    expect(result).toContain(`${partialProps.genre} | `);
    
    // Y que el texto "null" NO aparezca explícitamente en el output
    expect(result).not.toContain("null");
});

test("Asegura la presencia de clases de Tailwind CSS para el diseño", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });
    
    // Verificamos el contenedor principal
    expect(result).toContain('bg-white rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row'); 
    
    // Verificamos el badge de 'Autor Destacado'
    expect(result).toContain('bg-yellow-100 text-yellow-800'); 
    
    // Verificamos el estilo del botón 'Ver Perfil'
    expect(result).toContain('bg-[#01ada4] hover:bg-emerald-500'); 
    
    // Verificamos el estilo de la imagen (borde y forma circular)
    expect(result).toContain('rounded-full w-60 h-60 object-cover border-4 border-white');
});