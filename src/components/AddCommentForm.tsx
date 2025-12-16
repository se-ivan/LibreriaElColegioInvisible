import { useState } from 'react';
import { actions } from 'astro:actions';
import { useSWRConfig } from 'swr';

interface Props {
  bookId: number;
  user: { id: string; name?: string; image?: string | null } | null;
}

export default function AddCommentForm({ bookId, user }: Props) {
  const [title, setTitle] = useState(''); 
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { mutate } = useSWRConfig();

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-8">
        <p className="text-slate-700 mb-2">¿Leíste este libro? ¡Cuéntanos qué te pareció!</p>
        <a href="/login" className="inline-block text-sm font-bold text-blue-700 hover:underline">
          Inicia sesión para escribir una reseña
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
        setError("El título es obligatorio.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    const { data, error: actionError } = await actions.addComment({
      bookId,
      userId: user.id,
      title: title, 
      description: comment, 
    });

    setIsSubmitting(false);

    if (actionError) {
      setError(actionError.message);
      return;
    }

    setComment('');
    setTitle(''); 
    
    mutate(`/api/comments?bookId=${bookId}`);
    
    alert("¡Reseña publicada con éxito!");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Escribe tu reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold"
                placeholder="Ej. ¡Me encantó! o Una lectura obligada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu opinión</label>
            <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                rows={3}
                placeholder={`¿Qué opinas del libro, ${user.name}?`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            ></textarea>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publicando..." : "Publicar Reseña"}
          </button>
        </div>
      </form>
    </div>
  );
}