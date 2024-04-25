import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { ListDirectoryItem } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { getLastSegment } from '@utils';

const extractDirectItemPaths = (items: ItemWithContent[], path: string): Set<string> => {
    const directItems = new Set<string>();
    const amountFolderTraverse = path.split('/').length;

    for (const item of items) {
        const directItemPath = item.path.split('/').slice(0, amountFolderTraverse).join('/');
        directItems.add(directItemPath);
    }

    return directItems;
};

export const listDirectoryItems: Handler<ListDirectoryItem[], { Querystring: PathQueryStrings }> = async (req, res) => {
    const rawPath = req.query.path;

    const path = rawPath.endsWith('/') ? rawPath : rawPath + '/';

    try {
        const folderExist = await prisma.content.findFirst({
            where: {
                path: { startsWith: path }
            }
        });

        if (!folderExist) {
            return res.status(400).send({ message: DIRECTORY_NOT_FOUND });
        }

        const items = await prisma.file.findMany({
            where: {
                path: { startsWith: path }
            },
            select: {
                path: true,
                createdAt: true,
                type: true,
                Content: true
            }
        });

        const directItems = extractDirectItemPaths(items, path);

        const result: ListDirectoryItem[] = [];

        for (const itemPath of directItems) {
            try {
                const directFile = await prisma.file.findFirst({
                    where: { path: itemPath, type: FileType.RAW_FILE },
                    select: {
                        path: true,
                        createdAt: true,
                        Content: { select: { data: true } }
                    }
                });

                const itemName = getLastSegment(itemPath);

                if (directFile) {
                    result.push({
                        name: itemName,
                        createAt: directFile.createdAt,
                        size: directFile.Content.length > 0 ? directFile.Content[0].data.length : 0
                    });
                } else {
                    const folderSizeResult: { size: string }[] =
                        await prisma.$queryRaw`SELECT SUM(CHAR_LENGTH(data)) AS size FROM Content WHERE path LIKE CONCAT(${itemPath}, '/', '%')`;

                    const firstFolderItem = await prisma.file.findFirst({
                        where: {
                            path: { startsWith: itemPath },
                            type: FileType.DIRECTORY
                        },
                        orderBy: { createdAt: 'asc' }
                    });

                    result.push({
                        name: itemName + '/',
                        createAt: firstFolderItem?.createdAt || new Date(0),
                        size: Number(folderSizeResult[0]?.size) || 0
                    });
                }
            } catch (error) {
                logger.error(`Error processing item at path ${itemPath}: ${error}`);
            }
        }

        return res.send(result);
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
