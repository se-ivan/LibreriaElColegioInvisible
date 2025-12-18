import useSWRInfinite from 'swr/infinite'; 
import useSWRMutation from 'swr/mutation';
import { useState } from 'react';
import type { Comment } from '../data/mock-db';

interface CreateCommentsProps {
    bookId: number;
    userId: string;
}

type CreateCommentPayload = Omit<Comment, 'id' | 'user' | 'replies' | 'like'>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

async function sendComment(url: string, { arg }: { arg: CreateCommentPayload }) {

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg)
    });

    if (!res.ok) throw new Error("Error al crear comentario");
    return res.json();
}

export function CreateComments({ bookId, userId }: CreateCommentsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    const apiBase = "/api/comments/comments"; 


    const getKey = (pageIndex: number, previousPageData: Comment[]) => {

        if (previousPageData && !previousPageData.length) return null;
        
        return `${apiBase}?bookId=${bookId}&page=${pageIndex + 1}`;
    };

    const { data, size, setSize, isLoading, mutate: refreshList } = useSWRInfinite<Comment[]>(getKey, fetcher);

    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 5);
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

    const allComments = data ? data.flat() : [];

    const { trigger, isMutating } = useSWRMutation(apiBase, sendComment);

    const handleEvent = async () => {
        try {
            await trigger({
                title: title,
                description: description,
                bookId: bookId,
                userId: userId,
                createdAt: new Date(), 
            } as any);

            setTitle("");
            setDescription("");
            
            refreshList(); 
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <section className="w-full font-medium">
            <h2 className="text-3xl mt-12">Reseñas y Comentarios</h2>

            <div className="flex flex-col w-full bg-[#F9FCFF] border border-[#BFD6EC] rounded-2xl px-6 py-6 mt-6">
                <p>Comparte tu Opinión</p>

                <label className="mt-6" htmlFor="title">Título</label>
                <input
                    disabled={isMutating}
                    value={title}
                    id="title"
                    name="title"
                    onChange={e => setTitle(e.target.value)}
                    type="text"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Escribe un título..."
                />

                <label htmlFor="comment" className="mt-4">Tu Comentario</label>
                <textarea
                    disabled={isMutating}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    name="comment"
                    id="comment"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Comparte tu experiencia..."
                ></textarea>

                <button
                    disabled={isMutating}
                    className="bg-[#01ACA5] text-white rounded-xl h-10 w-45 mt-4 px-2 py-1 hover:bg-[#0f8b87] transition-colors duration-300 hover:cursor-pointer disabled:opacity-50"
                    onClick={() => handleEvent()}
                >
                    {isMutating ? 'Enviando...' : 'Publicar Comentario'}
                </button>
            </div>

            <div className="flex flex-col gap-4 mt-8 mb-16">
                {allComments.map((comentItem: Comment, idx: number) => (
                    <div key={`${comentItem.id}-${idx}`} className="w-full bg-[#F9FCFF] border border-[#DFEBF4] rounded-3xl flex flex-col items-centers font-medium py-8 sm:py-10 px-6 fade-in">
                        <p>{comentItem.user?.name} {comentItem.user?.lastName}</p>
                        <p className="mt-4 text-lg font-bold">{comentItem.title}</p>
                        <p className="md:text-xl mt-4 text-[#5B748E]">
                            {comentItem.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mb-12">
                {!isReachingEnd && (
                    <button
                        className="bg-azul-blanco text-azul-turquesa px-6 py-2 rounded-full hover:bg-[#00839729] transition-all duration-300 cursor-pointer  disabled:opacity-50"
                        onClick={() => setSize(size + 1)}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? "Cargando..." : "Cargar más comentarios"}
                    </button>
                )}
                
                {isReachingEnd && allComments.length > 0 && (
                    <p className="text-gray-400">No hay más comentarios.</p>
                )}
            </div>
        </section>
    );
}