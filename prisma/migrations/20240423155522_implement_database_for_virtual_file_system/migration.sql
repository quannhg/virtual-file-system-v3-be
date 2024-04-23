-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('RAW_FILE', 'DIRECTORY');

-- CreateTable
CREATE TABLE "File" (
    "path" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("path","type")
);

-- CreateTable
CREATE TABLE "Content" (
    "path" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("path","type")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_path_type_fkey" FOREIGN KEY ("path", "type") REFERENCES "File"("path", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
