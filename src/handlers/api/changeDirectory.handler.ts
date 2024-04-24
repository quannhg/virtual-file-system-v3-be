import { logger } from '@configs';
import { PATH_NOT_FOUND } from '@constants';
import { ChangeDirectoryQueryStrings } from '@dtos/in';
import { ChangeDirectoryResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const changeDirectory: Handler<ChangeDirectoryResult, { Querystring: ChangeDirectoryQueryStrings }> = async (req, res) => {
    const path = req.query.path;

    if (!path) {
        return res.send({ message: 'Successfully change directory' });
    }

    try {
        const file = await prisma.file.findFirst({
            where: {
                OR: [{ path: { startsWith: path + '/' } }, { path: path, type: FileType.DIRECTORY }]
            }
        });

        if (file) {
            return res.send({ message: 'Successfully change directory' });
        } else {
            return res.badRequest(PATH_NOT_FOUND);
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
