import useSWR from 'swr'
import type { Comment } from '../data/mock-db';
import useSWRMutation from 'swr/mutation';
import { useState } from 'react';

interface CreateCommentsProps {
    bookId: number;
    userId: string;
}

type CreateCommentPayload = Omit<Comment, 'id' | 'user' | 'replies' | 'like'>;
const fetcher = (url: string) => fetch(url).then(res => res.json())

async function sendComment(url: string, { arg }: { arg: CreateCommentPayload }) {
    
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg)
    })

    if (!res.ok) throw new Error("Error al crear libro");
    return res.json();
}

export function CreateComments({ bookId, userId }: CreateCommentsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    console.log(userId + "Buenas" + bookId)

    const apiURL = "http://localhost:4321/api/comments/comments";

    const { data, error } = useSWR<Comment[]>(apiURL, fetcher);
    const { trigger, isMutating } = useSWRMutation(apiURL, sendComment);

    const handleEvent = async () => {
        try {
            await trigger({
                title: title,
                description: description,
                bookId: bookId,
                userId: userId
            })
            setTitle("");
            setDescription("");
        } catch (e) {
            console.error(e);
        }
    };

    if (error) return <div className='self-center m-auto'>🚨 Error al cargar: {error.message}</div>;

    console.log(data);

    return (
        <section className="w-full font-medium">
            <h2 className="text-3xl mt-12">Reseñas y Comentarios</h2>

            <div
                className="flex flex-col w-full bg-[#F9FCFF] border border-[#BFD6EC] rounded-2xl px-6 py-6 mt-6"
            >
                <p>Comparte tu Opinion</p>

                <label className="mt-6" htmlFor="title">Titulo</label>
                <input
                    disabled={isMutating}
                    value={title}
                    id="title"
                    name="title"
                    onChange={e => setTitle(e.target.value)}
                    type="text"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Escribe un titulo para tu reseña"
                />

                <label htmlFor="comment" className="mt-4">Tu Comentario</label>
                <textarea
                    disabled={isMutating}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    name="comment"
                    id="comment"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Comparte tu experiencia con este libro..."
                ></textarea>

                <button
                    disabled={isMutating}
                    className="bg-[#01ACA5] text-white rounded-xl h-10 w-45 mt-4 px-2 py-1 hover:bg-[#0f8b87] transition-colors duration-300"
                    onClick={() => handleEvent()}
                >
                    Publicar Comentario
                </button>
            </div>

            <div className="flex flex-col gap-4 mt-8 mb-16">
                {
                    data?.map((comentItem: Comment, idx: number) => (
                        <div
                            className="w-full max-w-375 bg-[#F9FCFF] border border-[#DFEBF4] rounded-3xl flex flex-col items-centers font-medium py-8 sm:py-10 px-6"
                        >
                            <p>{comentItem.user.name + " " + comentItem.user.lastName}</p>
                            <p className="text-xs text-[#5B748E]">Hace 3 dias</p>
                            <p className="mt-4 text-lg">{comentItem.title}</p>
                            <p className="md:text-xl mt-4 text-[#5B748E]">
                                {comentItem.description}
                            </p>

                            <div>
                                <button className="bg-[#E0F2FF] text-texto-resaltado rounded-full px-3 py-2 mt-4 flex flex-row items-center justify-center"
                                ><span
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-thumb-up"
                                ><path stroke="none" d="M0 0h24v24H0z" fill="none"
                                ></path><path
                                    d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"
                                ></path></svg
                                        ></span
                                    >12</button
                                >
                            </div>
                        </div>

                    ))
                }
            </div>
        </section>
    );
}