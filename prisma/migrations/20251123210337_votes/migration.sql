-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "editorial" TEXT NOT NULL,
    "anio_publicacion" INTEGER NOT NULL,
    "author_id_author" INTEGER NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "book_author_id_author_fkey" FOREIGN KEY ("author_id_author") REFERENCES "author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_book" ("anio_publicacion", "author_id_author", "editorial", "id", "isbn", "price", "title") SELECT "anio_publicacion", "author_id_author", "editorial", "id", "isbn", "price", "title" FROM "book";
DROP TABLE "book";
ALTER TABLE "new_book" RENAME TO "book";
CREATE UNIQUE INDEX "book_isbn_key" ON "book"("isbn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
