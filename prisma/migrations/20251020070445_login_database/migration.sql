-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "is_user" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "editorial" TEXT NOT NULL,
    "anio_publicacion" INTEGER NOT NULL,
    "author_id_author" INTEGER NOT NULL,
    CONSTRAINT "book_author_id_author_fkey" FOREIGN KEY ("author_id_author") REFERENCES "author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "url_image" TEXT
);

-- CreateTable
CREATE TABLE "new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url_image" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pretitle" TEXT,
    "user_id_user" TEXT NOT NULL,
    CONSTRAINT "new_user_id_user_fkey" FOREIGN KEY ("user_id_user") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url_imagen" TEXT,
    "date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "cost" DECIMAL NOT NULL,
    "guest" TEXT,
    "user_id_user" TEXT NOT NULL,
    CONSTRAINT "event_user_id_user_fkey" FOREIGN KEY ("user_id_user") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "like" INTEGER NOT NULL DEFAULT 0,
    "user_id_user" TEXT NOT NULL,
    "book_id_book" INTEGER NOT NULL,
    CONSTRAINT "comment_user_id_user_fkey" FOREIGN KEY ("user_id_user") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comment_book_id_book_fkey" FOREIGN KEY ("book_id_book") REFERENCES "book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_comment" INTEGER NOT NULL,
    CONSTRAINT "reply_id_comment_fkey" FOREIGN KEY ("id_comment") REFERENCES "comment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "book_isbn_key" ON "book"("isbn");
