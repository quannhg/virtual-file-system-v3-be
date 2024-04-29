import { PrismaClient, FileType } from '@prisma/client';

const prisma = new PrismaClient();

async function generateData() {

    await prisma.file.create({
        data: {
            path: '/example/path/to/raw_file_txt',
            type: FileType.RAW_FILE,
            Content: {
                create: {
                    data: 'This is the content of the raw file.'
                }
            }
        }
    });

    await prisma.file.create({
        data: {
            path: '/example/path/to/directory',
            type: FileType.DIRECTORY
        }
    });

    await prisma.file.createMany({
        data: [
            {
                path: '/example/path/to/another_file_txt',
                type: FileType.RAW_FILE
            },
            {
                path: '/example/path/to/subdirectory',
                type: FileType.DIRECTORY
            }
        ]
    });

    process.exit(0);
}
generateData();
