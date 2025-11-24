export function CreateComments(){

    return(
        <section className="w-full font-medium">
            <h2 className="text-3xl mt-12">Reseñas y Comentarios</h2>

            <div
                className="flex flex-col w-full bg-[#F9FCFF] border border-[#BFD6EC] rounded-2xl px-6 py-6 mt-6"
            >
                <p>Comparte tu Opinion</p>

                <label className="mt-6" htmlFor="title">Titulo</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Escribe un titulo para tu reseña"
                />

                <label htmlFor="comment" className="mt-4">Tu Comentario</label>
                <textarea
                    name="comment"
                    id="comment"
                    className="border border-[#7DA9D2] rounded-lg mt-2 px-3 py-2"
                    placeholder="Comparte tu experiencia con este libro..."
                ></textarea>

                <button
                    className="bg-[#01ACA5] text-white rounded-xl h-10 w-45 mt-4 px-2 py-1"
                    onClick={() => {}}
                    id="btnComentarios"
                >
                    Publicar Comentario
                </button>
            </div>

            <div className="flex flex-col gap-4 mt-8 mb-16">
                {
                }
            </div>
        </section>
    );
}