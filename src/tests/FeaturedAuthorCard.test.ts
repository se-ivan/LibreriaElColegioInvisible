import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AutorDestac from '../components/AutorDestac.astro'; 
// Autor con todos los campos con nacionalidad
const fullProps = {
    id: 101,
    name: "Virginia Woolf",
    nationality: "Británica",
    genre: "Modernismo",
    description: "Novelista, ensayista, escritora de cartas, editora y feminista británica, considerada una de las figuras más destacadas del modernismo anglosajón.",
    imageUrl: "https://ejemplo.com/virginia_woolf.jpg",
};

 // Autor con nacionalidad null
const partialProps = {
    id: 102,
    name: "Emily Dickinson",
    nationality: null,
    genre: "Poesía",
    description: "Poetisa estadounidense cuya obra se publicó principalmente de forma póstuma.",
    imageUrl: "https://ejemplo.com/emily_dickinson.jpg",
};


test("Renderiza el componente y sus datos básicos correctamente", async () => {
    const container = await AstroContainer.create();
    //Renderiza el componente con todos los datos
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });

    // Vericia el nombre y descipcion
    expect(result).toContain(fullProps.name); 
    expect(result).toContain(fullProps.description); 
    // Verifica la imagen y su alt text
    expect(result).toContain(`src="${fullProps.imageUrl}"`);
    expect(result).toContain(`alt="Foto de ${fullProps.name}"`);
// Verifica el genero y nacionalinad    
    expect(result).toContain(`${fullProps.genre} | ${fullProps.nationality}`); 
// Verifica el titulo    
    expect(result).toContain("Autor Destacado");
});

test("Genera el enlace (href) correcto para 'Ver Perfil'", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });

    expect(result).toContain(`href="/autores/${fullProps.id}"`);
    expect(result).toContain("Ver Perfil");
});

test("Maneja la nacionalidad nula correctamente", async () => {
    const container = await AstroContainer.create();
    // Se rendiza con nacionalidad nula
    const result = await container.renderToString(AutorDestac, {
        props: partialProps
    });


    expect(result).toContain(partialProps.genre);
    
  
    expect(result).toContain(`${partialProps.genre} | `);
    
    
    expect(result).not.toContain("null");
});

test("Asegura la presencia de clases de Tailwind CSS para el diseño", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AutorDestac, {
        props: fullProps
    });
    
    expect(result).toContain('bg-white rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row'); 
    
    expect(result).toContain('bg-yellow-100 text-yellow-800'); 
    
    expect(result).toContain('bg-[#01ada4] hover:bg-emerald-500'); 
    
    expect(result).toContain('rounded-full w-60 h-60 object-cover border-4 border-white');
});