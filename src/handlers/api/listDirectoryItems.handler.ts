import { logger } from '@configs';
import { PATH_IS_REQUIRED } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { ListDirectoryItems } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const listDirectoryItems: Handler<ListDirectoryItems, { Querystring: PathQueryStrings }> = async (req, res) => {
    const path = req.query.path;

    if (!path) {
        return res.status(400).send({ error: PATH_IS_REQUIRED });
    }

    try {
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

        const directItems = new Set<string>();
        const amountFolderTraverse = path.split('/').length;

        for (const item of items) {
            const directItemPath = item.path
                .split('/')
                .slice(0, amountFolderTraverse + 1)
                .join('/');
            directItems.add(directItemPath);
        }

        const result: ListDirectoryItems = [];

        for (const path of directItems) {
            try {
                const adjacentItem = await prisma.file.findFirst({
                    where: { path },
                    select: {
                        path: true,
                        createdAt: true,
                        type: true,
                        Content: { select: { data: true } }
                    }
                });

                if (adjacentItem) {
                    const adjacentItemName =
                        adjacentItem.path.split('/').slice(-1)[0] + (adjacentItem.type === FileType.DIRECTORY ? '/' : '');
                    let size = 0;

                    if (adjacentItem.type === FileType.DIRECTORY) {
                        const folderSizeResult: { size: number }[] =
                            await prisma.$queryRaw`SELECT SUM(CHAR_LENGTH(data)) AS size FROM Content WHERE path LIKE ${adjacentItem.path}%`;
                        size = folderSizeResult[0]?.size || 0;
                    } else {
                        size = adjacentItem.Content.length > 0 ? adjacentItem.Content[0].data.length : 0;
                    }

                    result.push({
                        name: adjacentItemName,
                        createAt: adjacentItem.createdAt,
                        size
                    });
                }
            } catch (error) {
                logger.error(`Error processing item at path ${path}: ${error}`);
            }
        }

        return res.send(result);
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
