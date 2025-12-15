import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BookCommentsProps {
  bookId: string | number;
}

export default function BookComments({ bookId }: BookCommentsProps) {
  const { data: comments, error, isLoading } = useSWR(
    `/api/comments?bookId=${bookId}`, 
    fetcher
  );

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500 animate-pulse">Cargando reseñas...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error al cargar reseñas.</div>;
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">No hay reseñas todavía.</p>
        <p className="text-sm text-gray-400">¡Sé el primero en opinar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: any) => {
        const userName = comment.user ? `${comment.user.name} ${comment.user.lastName || ''}` : "Usuario Anónimo";
        const date = new Date(comment.createdAt || Date.now()).toLocaleDateString();

        return (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{userName}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{date}</p>
              </div>
            </div>
            
            {comment.title && (
                <h5 className="text-sm font-bold text-gray-800 mb-1">{comment.title}</h5>
            )}

            <p className="text-slate-600 text-sm leading-relaxed border-t border-gray-50 pt-3 mt-2 sm:border-0 sm:pt-0 sm:mt-0">
              {comment.description || comment.content || "Sin comentario."}
            </p>
          </div>
        );
      })}
    </div>
  );
}