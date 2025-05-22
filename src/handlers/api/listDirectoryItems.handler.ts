import { logger } from '@configs';
import { redisConfig } from '@configs/redis';
import { DIRECTORY_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { ListDirectoryItem } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { getLastSegment, normalizePath, getCache, setCache, cacheKeys } from '@utils';
import moment from 'moment';

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

    if (!rawPath) {
        return res.unprocessableEntity(PATH_IS_REQUIRED);
    }

    const normalizeResult = await normalizePath(rawPath);
    if (normalizeResult.invalid) {
        return res.badRequest(normalizeResult.message);
    }
    const path = normalizeResult.path + '/';

    try {
        // Try to get from cache first
        const cacheKey = cacheKeys.directoryListing(path.slice(0, -1));
        const cachedListing = await getCache<ListDirectoryItem[]>(cacheKey);

        if (cachedListing) {
            return res.send(cachedListing);
        }

        // If not in cache, proceed with database queries
        const exactFile = await prisma.file.findFirst({
            where: {
                path: path.slice(0, -1),
                type: FileType.RAW_FILE
            }
        });
        if (exactFile) {
            return res.status(400).send({ message: 'Path must refer to a directory, not a file' });
        }

        const folderExist = await prisma.file.findFirst({
            where: {
                OR: [{ path: path.slice(0, -1), type: FileType.DIRECTORY }, { path: { startsWith: path } }]
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
                name: true,
                size: true,
                content: true
            }
        });

        const directItems = extractDirectItemPaths(items, path);

        const result: ListDirectoryItem[] = [];

        for (const itemPath of directItems) {
            const directFile = await prisma.file.findFirst({
                where: { path: itemPath, type: FileType.RAW_FILE },
                select: {
                    path: true,
                    createdAt: true,
                    name: true,
                    size: true
                }
            });

            const itemName = getLastSegment(itemPath);

            if (directFile) {
                result.push({
                    name: directFile.name,
                    createAt: moment(directFile.createdAt).toString(),
                    type: FileType.RAW_FILE,
                    size: directFile.size ?? 0
                });

                continue;
            }

            //symlink
            const symlinkFile = await prisma.file.findFirst({
                where: { path: itemPath, type: FileType.SYMLINK },
                select: {
                    createdAt: true,
                    targetPath: true,
                    name: true,
                    size: true
                }
            });

            if (symlinkFile) {
                result.push({
                    name: symlinkFile.name + ' → ' + symlinkFile.targetPath,
                    type: FileType.SYMLINK,
                    createAt: moment(symlinkFile.createdAt).toString(),
                    size: symlinkFile.size ?? 0
                });

                continue;
            }

            // directory
            const folderSizeResult: { size: string }[] =
                await prisma.$queryRaw`SELECT SUM(CHAR_LENGTH(data)) AS size FROM Content WHERE path LIKE CONCAT(${itemPath}, '/', '%')`;

            const directoryEntry = await prisma.file.findUnique({
                where: { path: itemPath },
                select: {
                    name: true,
                    createdAt: true
                }
            });

            result.push({
                name: (directoryEntry?.name ?? itemName) + '/',
                type: FileType.DIRECTORY,
                createAt: (directoryEntry && moment(directoryEntry.createdAt).toString()) || '0',
                size: Number(folderSizeResult[0]?.size) || 0
            });
        }

        // Cache the result before returning
        await setCache(cacheKey, result, redisConfig.ttl.directoryListing);
        return res.send(result);
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
