import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { ListDirectoryItem } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { getLastSegment, normalizePath } from '@utils';
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
                Content: true
            }
        });

        const directItems = extractDirectItemPaths(items, path);

        const result: ListDirectoryItem[] = [];

        for (const itemPath of directItems) {
            const itemName = getLastSegment(itemPath);
        
            // 1. SYMLINK
            const symlinkFile = await prisma.file.findFirst({
                where: { path: itemPath, type: FileType.SYMLINK },
                select: {
                    createdAt: true,
                    targetPath: true
                }
            });
        
            if (symlinkFile) {
                const targetFile = await prisma.file.findFirst({
                    where: { path: symlinkFile.targetPath ?? undefined },
                    include: { Content: true }
                });
        
                const size =
                    targetFile?.type === FileType.RAW_FILE
                        ? targetFile.Content[0]?.data.length || 0
                        : (
                              await prisma.$queryRaw<
                                  { size: string }[]
                              >`SELECT SUM(CHAR_LENGTH(data)) AS size FROM Content WHERE path LIKE CONCAT(${symlinkFile.targetPath}, '/', '%')`
                          )[0]?.size || 0;
        
                result.push({
                    name: itemName + ' → ' + symlinkFile.targetPath,
                    type: FileType.SYMLINK,
                    createAt: moment(symlinkFile.createdAt).toString(),
                    size: Number(size)
                });
        
                continue;
            }
        
            // 2. RAW_FILE
            const directFile = await prisma.file.findFirst({
                where: { path: itemPath, type: FileType.RAW_FILE },
                select: {
                    createdAt: true,
                    Content: { select: { data: true } }
                }
            });
        
            if (directFile) {
                result.push({
                    name: itemName,
                    type: FileType.RAW_FILE,
                    createAt: moment(directFile.createdAt).toString(),
                    size: directFile.Content[0]?.data.length || 0
                });
        
                continue;
            }
        
            // 3. DIRECTORY
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
                type: FileType.DIRECTORY,
                createAt: (firstFolderItem && moment(firstFolderItem.createdAt).toString()) || '0',
                size: Number(folderSizeResult[0]?.size) || 0
            });
        }
        

        return res.send(result);
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
