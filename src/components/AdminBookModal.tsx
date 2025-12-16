import { useState, useEffect } from 'react';
import { actions } from 'astro:actions';

const CLOUD_NAME = "dnod52h4j";
const UPLOAD_PRESET = "sf8en1mh";

async function uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir imagen a Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;

    } catch (error) {
        console.error("Error subiendo a Cloudinary:", error);
        throw error;
    }
}

interface Props {
  bookToEdit?: any;
}

export default function AdminBookModal({ bookToEdit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [isEditMode, setIsEditMode] = useState(!!bookToEdit);
  const [editId, setEditId] = useState<number | null>(bookToEdit?.id || null);
  const [authorsList, setAuthorsList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '', isbn: '', price: '', authorId: '',
    editorial: '', publicationYear: '', description: '', 
    imageUrl: ''
  });

  useEffect(() => {
    async function loadAuthors() {
        const { data } = await actions.getAuthors();
        if (data) setAuthorsList(data);
    }
    loadAuthors();
  }, []);

  useEffect(() => {
    if (bookToEdit) fillForm(bookToEdit);
  }, [bookToEdit]);

  useEffect(() => {
    const handleOpenCreate = () => {
        resetForm();
        setIsEditMode(false);
        setEditId(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (event: CustomEvent) => {
        const book = event.detail;
        fillForm(book);
        setIsEditMode(true);
        setEditId(book.id);
        setIsOpen(true);
    };

    window.addEventListener('open-book-create', handleOpenCreate as any);
    window.addEventListener('open-book-edit', handleOpenEdit as any);

    return () => {
        window.removeEventListener('open-book-create', handleOpenCreate as any);
        window.removeEventListener('open-book-edit', handleOpenEdit as any);
    };
  }, []);

  const resetForm = () => {
      setFormData({
        title: '', isbn: '', price: '', authorId: '',
        editorial: '', publicationYear: '', imageUrl: '', description: ''
      });
      setSelectedFile(null);
      setImagePreview('');
  };

  const fillForm = (book: any) => {
      setFormData({
        title: book.title || '',
        isbn: book.isbn || '',
        price: book.price?.toString() || '',
        authorId: book.authorId?.toString() || '',
        editorial: book.editorial || '',
        publicationYear: book.publicationYear?.toString() || '',
        imageUrl: book.imageUrl || book.coverImage || '',
        description: book.description || ''
      });
      setImagePreview(book.imageUrl || book.coverImage || '');
      setSelectedFile(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        let finalImageUrl = formData.imageUrl;

        if (selectedFile) {
            finalImageUrl = await uploadImageToCloudinary(selectedFile);
        } else if (isEditMode && !imagePreview) {
            finalImageUrl = '';
        }

        const payload = {
            title: formData.title,
            isbn: formData.isbn,
            price: Number(formData.price),
            authorId: Number(formData.authorId),
            editorial: formData.editorial || undefined,
            publicationYear: Number(formData.publicationYear) || undefined,
            description: formData.description || undefined,
            imageUrl: finalImageUrl || undefined,
        };

        let error;
        if (isEditMode && editId) {
            const res = await actions.updateBook({ ...payload, id: editId });
            error = res.error;
        } else {
            const res = await actions.createBook(payload);
            error = res.error;
        }

        if (error) {
            alert(`Error en base de datos: ${error.message}`);
            setIsSubmitting(false);
            return;
        }

        alert(isEditMode ? '¡Libro actualizado!' : '¡Libro registrado!');
        setIsOpen(false);
        window.location.reload();

    } catch (err: any) {
        alert("Error al subir imagen: " + err.message);
        setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/50 animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{isEditMode ? 'Editar Libro' : 'Nuevo Libro'}</h2>
                    <p className="text-sm text-slate-500">Gestión del catálogo con Cloudinary.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título *</label>
                    <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Título" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN *</label>
                        <input name="isbn" value={formData.isbn} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="ISBN" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio *</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="0.00" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ID Autor *</label>
                        <select name="authorId" value={formData.authorId} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                            <option value="">-- Seleccionar --</option>
                            {authorsList.map(author => (
                                <option key={author.id} value={author.id}>{author.name} {author.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Editorial</label>
                        <input name="editorial" value={formData.editorial} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Opcional" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Año</label>
                        <input name="publicationYear" type="number" value={formData.publicationYear} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="2024" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portada (Imagen)</label>
                    <div className="flex gap-4 items-center">
                        <div className="w-20 h-28 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 relative shadow-sm">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">📷</span>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <input 
                                type="file" 
                                id="file-upload" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label 
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors text-sm font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {selectedFile ? 'Cambiar archivo' : 'Subir imagen'}
                            </label>
                            <p className="text-xs text-slate-400 mt-2">
                                {selectedFile 
                                    ? `Seleccionado: ${selectedFile.name}` 
                                    : 'Formatos: JPG, PNG, WEBP. Se subirá a Cloudinary.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
                    <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 resize-none" placeholder="Sinopsis..." />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancelar</button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 disabled:opacity-70 flex items-center gap-2 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {selectedFile ? 'Subiendo...' : 'Guardando...'}
                            </>
                        ) : (isEditMode ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}