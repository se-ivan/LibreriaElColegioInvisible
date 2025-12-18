import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AuthorCard from '../components/AuthorCard.astro';


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
    
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

   // Verificar el nombre del autor
    expect(result).toContain(testProps.name); 
    
    // Verificar la nacionalidad
    expect(result).toContain(testProps.nationality); 
    
  // Verificar el género
    expect(result).toContain(testProps.genre); 
    
    
    expect(result).toContain(`Libros publicados: ${testProps.totalBooks}`);
});

test("Renderiza la imagen del autor con la URL y el alt text correctos", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

    // Verificar el atributo 'src'
    expect(result).toContain(`src="${testProps.imageUrl}"`);
    
   // Verificar el 'alt' text usando el nombre (por accesibilidad)
    expect(result).toContain(`alt="Foto de ${testProps.name}"`);
});

test("Genera el enlace (href) correcto para 'Ver Perfil'", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });

   
    expect(result).toContain(`href="/autores/${testProps.id}"`);
    
    
    expect(result).toContain("Ver Perfil");
});

test("Asegura la presencia de clases de Tailwind CSS para estilos clave", async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(AuthorCard, {
        props: testProps
    });
    
    // Verificamos algunas clases de estilo para el diseño
    expect(result).toContain('bg-[#f9fcfe]'); 
    expect(result).toContain('shadow-md');   
    expect(result).toContain('hover:scale-[1.02]'); 
    expect(result).toContain('bg-blue-100'); 
});