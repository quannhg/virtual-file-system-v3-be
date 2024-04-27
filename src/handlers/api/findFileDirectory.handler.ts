import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND } from '@constants';
import { FindFileDirectoryQueryStrings } from '@dtos/in';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { normalizePath } from '@utils';

const extractMatchingPaths = (item: SimpleItem, keyString: string): string | null => {
    const pathParts = item.path.split('/');
    const matchingIndex = pathParts.reverse().findIndex((part) => part.includes(keyString));
    if (matchingIndex !== -1) {
        const matchingPath = pathParts.slice(matchingIndex, pathParts.length).reverse().join('/');
        if (item.type === 'RAW_FILE' && pathParts.length === 1) return matchingPath;
        else return matchingPath + '/';
    }
    return null;
};

export const findDirectoryItems: Handler<string[], { Querystring: FindFileDirectoryQueryStrings }> = async (req, res) => {
    const { keyString, path: rawPath } = req.query;

    const path = normalizePath(rawPath) + '/';

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

        const matchingItems = await prisma.file.findMany({
            where: {
                path: { search: `${path}*${keyString}*` }
            },
            select: {
                path: true,
                type: true
            }
        });

        const matchingPaths = new Set<string>();

        matchingItems.forEach((item) => {
            const matchingPath = extractMatchingPaths({ ...item, path: item.path.slice(path.length, -1) }, keyString);
            if (matchingPath) matchingPaths.add(matchingPath);
        });

        return res.send(Array.from(matchingPaths).sort());
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
