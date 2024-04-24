-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(511) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `githubUsername` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `birthdate` INTEGER NULL,
    `avatarUrl` VARCHAR(255) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `joinedAt` INTEGER NOT NULL,
    `leaveAt` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `path` VARCHAR(191) NOT NULL,
    `type` ENUM('RAW_FILE', 'DIRECTORY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FULLTEXT INDEX `File_path_idx`(`path`),
    PRIMARY KEY (`path`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Content` (
    `path` VARCHAR(191) NOT NULL,
    `type` ENUM('RAW_FILE', 'DIRECTORY') NOT NULL,
    `data` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`path`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_path_type_fkey` FOREIGN KEY (`path`, `type`) REFERENCES `File`(`path`, `type`) ON DELETE RESTRICT ON UPDATE CASCADE;
