import { PrismaClient, FileType } from '@prisma/client';

const prisma = new PrismaClient();

async function generateData() {
    // Xoá hết dữ liệu cũ nếu có
    await prisma.content.deleteMany();
    await prisma.file.deleteMany();

    const files = [
        {
            path: '/docs/readme.txt',
            name: 'readme.txt',
            type: FileType.RAW_FILE,
            size: 45,
            content: {
                create: {
                    data: 'This is the readme file content for the docs folder.'
                }
            }
        },
        {
            path: '/docs/tutorial.md',
            name: 'tutorial.md',
            type: FileType.RAW_FILE,
            size: 48,
            content: {
                create: {
                    data: '# Tutorial\nThis is a tutorial markdown file.'
                }
            }
        },
        {
            path: '/docs/guide/intro.txt',
            name: 'intro.txt',
            type: FileType.RAW_FILE,
            size: 43,
            content: {
                create: {
                    data: 'Introduction to the guide. Hello file world!'
                }
            }
        },
        {
            path: '/docs/guide/chapter1.txt',
            name: 'chapter1.txt',
            type: FileType.RAW_FILE,
            size: 70,
            content: {
                create: {
                    data: 'Chapter 1 content.\nThis file contains useful data.\nThe end.'
                }
            }
        },
        {
            path: '/logs/system.log',
            name: 'system.log',
            type: FileType.RAW_FILE,
            size: 30,
            content: {
                create: {
                    data: 'System log file with some warnings and errors.'
                }
            }
        },
        {
            path: '/images/banner.txt',
            name: 'banner.txt',
            type: FileType.RAW_FILE,
            size: 27,
            content: {
                create: {
                    data: 'Banner file content not important.'
                }
            }
        },
        {
            path: '/about.txt',
            name: 'about.txt',
            type: FileType.RAW_FILE,
            size: 20,
            content: {
                create: {
                    data: 'about file - nothing much'
                }
            }
        }
    ];

    const directories = ['/docs', '/docs/guide', '/logs', '/images'];

    await Promise.all(
        directories.map((dirPath) =>
            prisma.file.create({
                data: {
                    path: dirPath,
                    name: dirPath.split('/').pop() || '/',
                    type: FileType.DIRECTORY
                }
            })
        )
    );

    for (const file of files) {
        await prisma.file.create({ data: file });
    }

    console.log('✅ Seeded example files and directories for grep test.');
    process.exit(0);
}

generateData();
