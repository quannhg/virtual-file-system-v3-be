import { logger } from '@configs';
import { FILE_NOT_FOUND, FILE_OR_DIRECTORY_NOT_FOUND } from '@constants';
import { UpdateFileDirectoryBody } from '@dtos/in';
import { SingleMessageResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { normalizePath, invalidateFileCache, invalidateDirectoryCache } from '@utils';
import path from 'path';
import { appendPath } from 'src/utils/appendPath';
import { checkExistingPath } from 'src/utils/checkExistingPath';

export const updateFileDirectory: Handler<SingleMessageResult, { Body: UpdateFileDirectoryBody }> = async (req, res) => {
    const { oldPath: rawOldPath, newPath: rawNewPath, newData } = req.body;

    if (!rawOldPath || !rawNewPath) {
        return res.unprocessableEntity("Please provide both 'old' and 'new' path.");
    }

    const oldPathNormalizeResult = await normalizePath(rawOldPath);
    const newPathNormalizeResult = await normalizePath(rawNewPath);
    if (oldPathNormalizeResult.invalid) {
        return res.badRequest(oldPathNormalizeResult.message);
    }
    if (newPathNormalizeResult.invalid) {
        return res.badRequest(newPathNormalizeResult.message);
    }

    const oldPath = oldPathNormalizeResult.path;
    const newPath = newPathNormalizeResult.path;

    if (path.dirname(oldPath) !== path.dirname(newPath)) {
        return res.badRequest('Update only supported change name of item at last segment! Using mv to change parent directory instead.');
    }

    try {
        if (newData) {
            const updatedFile = await prisma.file.findFirst({
                where: {
                    path: oldPath
                },
                select: {
                    path: true,
                    type: true
                }
            });

            if (!updatedFile) return res.notFound(FILE_NOT_FOUND);

            if (updatedFile.type === FileType.DIRECTORY) {
                return res.badRequest('Cannot add data to a directory. Only files can have data.');
            }

            if (oldPath !== newPath) {
                const existingPath = await checkExistingPath(newPath);
                if (existingPath) {
                    return res.badRequest(`File or directory already exists at path: ${existingPath}`);
                }
            }

            await prisma.$transaction(async (prisma) => {
                await prisma.file.update({
                    where: {
                        path: oldPath
                    },
                    data: {
                        path: newPath
                    }
                });

                await prisma.content.upsert({
                    where: {
                        path: newPath
                    },
                    update: {
                        data: newData
                    },
                    create: {
                        path: newPath,
                        data: newData
                    }
                });
            });

            // Invalidate cache for both old and new paths
            await invalidateFileCache(oldPath);
            await invalidateFileCache(newPath);
            await invalidateDirectoryCache(path.dirname(oldPath));
            await invalidateDirectoryCache(path.dirname(newPath));

            return res.send({ message: 'Successfully updated file' });
        } else {
            const updateItems = await prisma.file.findMany({
                where: {
                    OR: [{ path: { startsWith: oldPath + '/' } }, { path: oldPath }]
                },
                select: {
                    path: true,
                    type: true
                }
            });

            if (updateItems.length === 0) {
                return res.notFound(FILE_OR_DIRECTORY_NOT_FOUND);
            }

            const existingPath = await checkExistingPath(newPath);
            if (existingPath) {
                return res.badRequest(`File or directory already exists at path: ${existingPath}`);
            }

            for (const item of updateItems) {
                const absoluteNewPath = appendPath(newPath, item.path.slice(oldPath.length, item.path.length));

                await prisma.file.update({
                    where: {
                        path: item.path
                    },
                    data: {
                        path: absoluteNewPath
                    }
                });

                // Invalidate cache for each updated path
                await invalidateFileCache(item.path);
                await invalidateFileCache(absoluteNewPath);
                await invalidateDirectoryCache(path.dirname(item.path));
                await invalidateDirectoryCache(path.dirname(absoluteNewPath));
            }
            return res.send({ message: 'Successfully updated file/directory' });
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
