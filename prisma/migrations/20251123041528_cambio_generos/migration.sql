-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "url_image" TEXT,
    "nationality" TEXT,
    "genre" TEXT NOT NULL DEFAULT 'Unknown'
);
INSERT INTO "new_author" ("biography", "birthdate", "genre", "id", "last_name", "name", "nationality", "url_image") SELECT "biography", "birthdate", "genre", "id", "last_name", "name", "nationality", "url_image" FROM "author";
DROP TABLE "author";
ALTER TABLE "new_author" RENAME TO "author";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
