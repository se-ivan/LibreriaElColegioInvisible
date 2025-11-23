/*
  Warnings:

  - You are about to alter the column `price` on the `book` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `cost` on the `event` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.

*/
-- CreateTable
CREATE TABLE "donaciones" (
    "id_Donaciones" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "quantity_book" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "message" TEXT,
    "User_id_user" TEXT NOT NULL,
    CONSTRAINT "donaciones_User_id_user_fkey" FOREIGN KEY ("User_id_user") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    CONSTRAINT "book_author_id_author_fkey" FOREIGN KEY ("author_id_author") REFERENCES "author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_book" ("anio_publicacion", "author_id_author", "editorial", "id", "isbn", "price", "title") SELECT "anio_publicacion", "author_id_author", "editorial", "id", "isbn", "price", "title" FROM "book";
DROP TABLE "book";
ALTER TABLE "new_book" RENAME TO "book";
CREATE UNIQUE INDEX "book_isbn_key" ON "book"("isbn");
CREATE TABLE "new_event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url_imagen" TEXT,
    "date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "cost" REAL NOT NULL,
    "guest" TEXT,
    "user_id_user" TEXT NOT NULL,
    CONSTRAINT "event_user_id_user_fkey" FOREIGN KEY ("user_id_user") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_event" ("cost", "date", "description", "end_time", "guest", "id", "start_time", "title", "url_imagen", "user_id_user") SELECT "cost", "date", "description", "end_time", "guest", "id", "start_time", "title", "url_imagen", "user_id_user" FROM "event";
DROP TABLE "event";
ALTER TABLE "new_event" RENAME TO "event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
