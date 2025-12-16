import { actions } from 'astro:actions';
export default function BookAdminControls({ book }: { book: any }) {
  const handleEdit = () => {
    window.dispatchEvent(new CustomEvent('open-book-edit', { detail: book }));
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${book.title}"? Esta acción no se puede deshacer.`)) return;

    const { error } = await actions.deleteBook({ id: book.id });
    
    if (error) {
        alert('Error al eliminar: ' + error.message);
    } else {
        window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        
        <button 
            onClick={handleEdit}
            className="group flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition-all duration-300"
            title="Editar Libro"
        >
            <span className="text-lg">✏️</span>
            <span className="text-sm">Editar</span>
        </button>
        
        <button 
            onClick={handleDelete}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Eliminar Libro"
        >
            <span className="text-lg">🗑️</span>
        </button>
    </div>
  );
}