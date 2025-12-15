// src/types/strapi.ts (Crea este archivo)

// 1. Interfaz para los atributos de la imagen (lo que realmente contiene la URL)
export interface StrapiImageAttributes {
    url: string;
    // ... otros campos como width, height, mime, etc.
}

// 2. Interfaz para el objeto 'data' de la imagen (la estructura anidada)
export interface StrapiImageData {
    attributes: StrapiImageAttributes;
    // ... otros campos de la API REST
}

// 3. Interfaz para los atributos de la Noticia
export interface NoticiaAttributes {
    title: string;
    pretitle: string;
    date: string; // La fecha viene como string ISO
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    // El campo 'image' que debe ser populado
    imageUrl?: { 
        data: StrapiImageData | null; 
    } | null;
}

// 4. Interfaz para el objeto de Noticia individual que devuelve Strapi
export interface StrapiNoticia {
    id: number;
    attributes: NoticiaAttributes;
}

export interface NewsItem {
    id: number;
    title: string;
    pretitle: string;
    date: string; // O Date, dependiendo de cómo lo uses
    image: string | null;
}