import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { FindFileDirectoryQueryStrings } from '@dtos/in';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { normalizePath } from '@utils';
import { ListDirectoryItem } from '@dtos/out';

export const findDirectoryItems: Handler<ListDirectoryItem[], { Querystring: FindFileDirectoryQueryStrings }> = async (req, res) => {
    const { keyString, path: rawPath, contentSearch } = req.query;

    if (!rawPath) {
        return res.status(422).send({ message: PATH_IS_REQUIRED });
    }

    const normalizeResult = await normalizePath(rawPath);
    if (normalizeResult.invalid) {
        return res.status(400).send({ message: 'Invalid path' });
    }
    const path = normalizeResult.path.endsWith('/') ? normalizeResult.path : `${normalizeResult.path}/`;

    try {
        const exactFile = await prisma.file.findFirst({
            where: { path: path.slice(0, -1), type: FileType.RAW_FILE }
        });
        if (exactFile) {
            return res.status(400).send({ message: 'Path must refer to a directory, not a file' });
        }

        const folderExists = await prisma.file.findFirst({
            where: {
                OR: [{ path: path.slice(0, -1), type: FileType.DIRECTORY }, { path: { startsWith: path } }]
            }
        });
        if (!folderExists) {
            return res.status(400).send({ message: DIRECTORY_NOT_FOUND });
        }

        const filesInDirectory = await prisma.file.findMany({
            where: { path: { startsWith: path }, type: FileType.RAW_FILE },
            select: { path: true }
        });
        if (filesInDirectory.length === 0) {
            return res.send([]);
        }

        const conditions = [];
        if (contentSearch) {
            conditions.push({
                content: {
                    data: {
                        contains: contentSearch // ❌ bỏ mode
                    }
                }
            });
        }
        if (keyString) {
            conditions.push({
                name: {
                    contains: keyString // ❌ bỏ mode
                }
            });
        }

        const matchingFiles = await prisma.file.findMany({
            where: {
                path: { in: filesInDirectory.map((f) => f.path) },
                type: FileType.RAW_FILE,
                ...(conditions.length > 0 ? { OR: conditions } : {})
            },
            select: {
                name: true,
                createdAt: true,
                size: true
            }
        });

        return res.status(200).send(matchingFiles.map((file) => `${path}${file.name}`));
    } catch (err) {
        logger.error('Error in findDirectoryItems:', { error: err, query: { keyString, path: rawPath, contentSearch } });
        return res.status(500).send({ message: 'An internal server error occurred. Please try again later.' });
    }
};
