-- SQL script to create all tables in Turso database
-- Generated from prisma/schema.prisma

-- User table (for Auth.js)
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "last_name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "is_user" INTEGER NOT NULL DEFAULT 1
);

-- Account table (for Auth.js OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
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
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
    UNIQUE("provider", "providerAccountId")
);

-- Session table (for Auth.js)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- VerificationToken table (for Auth.js)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" DATETIME NOT NULL,
    UNIQUE("identifier", "token")
);

-- Author table
CREATE TABLE IF NOT EXISTS "author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "birthdate" DATETIME NOT NULL,
    "url_image" TEXT
);

-- Book table
CREATE TABLE IF NOT EXISTS "book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isbn" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "editorial" TEXT NOT NULL,
    "anio_publicacion" INTEGER NOT NULL,
    "author_id_author" INTEGER NOT NULL,
    FOREIGN KEY ("author_id_author") REFERENCES "author"("id")
);

-- New table
CREATE TABLE IF NOT EXISTS "new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url_image" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pretitle" TEXT,
    "user_id_user" TEXT NOT NULL,
    FOREIGN KEY ("user_id_user") REFERENCES "user"("id")
);

-- Event table
CREATE TABLE IF NOT EXISTS "event" (
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
    FOREIGN KEY ("user_id_user") REFERENCES "user"("id")
);

-- Comment table
CREATE TABLE IF NOT EXISTS "comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "like" INTEGER NOT NULL DEFAULT 0,
    "user_id_user" TEXT NOT NULL,
    "book_id_book" INTEGER NOT NULL,
    FOREIGN KEY ("user_id_user") REFERENCES "user"("id"),
    FOREIGN KEY ("book_id_book") REFERENCES "book"("id")
);

-- Reply table
CREATE TABLE IF NOT EXISTS "reply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_comment" INTEGER NOT NULL,
    FOREIGN KEY ("id_comment") REFERENCES "comment"("id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "book_author_id_author_idx" ON "book"("author_id_author");
CREATE INDEX IF NOT EXISTS "new_user_id_user_idx" ON "new"("user_id_user");
CREATE INDEX IF NOT EXISTS "event_user_id_user_idx" ON "event"("user_id_user");
CREATE INDEX IF NOT EXISTS "comment_user_id_user_idx" ON "comment"("user_id_user");
CREATE INDEX IF NOT EXISTS "comment_book_id_book_idx" ON "comment"("book_id_book");
CREATE INDEX IF NOT EXISTS "reply_id_comment_idx" ON "reply"("id_comment");
