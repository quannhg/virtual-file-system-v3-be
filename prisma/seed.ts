import { PrismaClient, FileType } from '@prisma/client';

const prisma = new PrismaClient();

async function generateData() {
    // Tạo file RAW với content
    await prisma.file.create({
        data: {
            path: '/example/path/to/raw_file_txt',
            name: 'raw_file_txt',
            type: FileType.RAW_FILE,
            size: 36,
            content: {
                create: {
                    data: 'This is the content of the raw file.'
                }
            }
        }
    });

    // Tạo thư mục
    await prisma.file.create({
        data: {
            path: '/example/path/to/directory',
            name: 'directory',
            type: FileType.DIRECTORY
        }
    });

    // Tạo nhiều file/directory khác
    await prisma.file.createMany({
        data: [
            {
                path: '/example/path/to/another_file_txt',
                name: 'another_file_txt',
                type: FileType.RAW_FILE,
                size: 20
            },
            {
                path: '/example/path/to/subdirectory',
                name: 'subdirectory',
                type: FileType.DIRECTORY
            }
        ]
    });

    console.log('🌱 Seed data inserted successfully.');
    process.exit(0);
}

generateData();
