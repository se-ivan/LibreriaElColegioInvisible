import { useState, useEffect } from 'react';
import { actions } from 'astro:actions';

interface Props {
  bookToEdit?: any;
}

export default function AdminBookModal({ bookToEdit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!bookToEdit);
  const [editId, setEditId] = useState<number | null>(bookToEdit?.id || null);

  const [authorsList, setAuthorsList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '', isbn: '', price: '', authorId: '',
    editorial: '', publicationYear: '', imageUrl: '', description: ''
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        title: formData.title,
        isbn: formData.isbn,
        price: Number(formData.price),
        authorId: Number(formData.authorId),
        editorial: formData.editorial || undefined,
        publicationYear: Number(formData.publicationYear) || undefined,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
    };

    let error;

    if (isEditMode && editId) {
        const res = await actions.updateBook({ ...payload, id: editId });
        error = res.error;
    } else {
        const res = await actions.createBook(payload);
        error = res.error;
    }

    setIsSubmitting(false);

    if (error) {
        alert(`Error: ${error.message}`);
        return;
    }

    alert(isEditMode ? '¡Libro actualizado!' : '¡Libro registrado!');
    setIsOpen(false);
    window.location.reload(); 
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setIsOpen(false)}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/50 animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{isEditMode ? 'Editar Libro' : 'Nuevo Libro'}</h2>
                    <p className="text-sm text-slate-500">Gestión del catálogo.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título *</label>
                        <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Título del libro" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN *</label>
                        <input name="isbn" value={formData.isbn} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="978-..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio ($) *</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="0.00" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* SELECTOR DE AUTOR */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Autor *</label>
                        <select name="authorId" value={formData.authorId} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                            <option value="">-- Seleccionar Autor --</option>
                            {authorsList.map(author => (
                                <option key={author.id} value={author.id}>
                                    {author.name} {author.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Imagen</label>
                    <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500" placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
                    <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 resize-none" placeholder="Sinopsis..." />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 disabled:opacity-70 flex items-center gap-2">
                        {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}