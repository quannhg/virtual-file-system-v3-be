import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { SingleMessageResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const changeDirectory: Handler<SingleMessageResult, { Querystring: PathQueryStrings }> = async (req, res) => {
    const path = req.query.path;

    if (!path) {
        return res.badRequest(PATH_IS_REQUIRED);
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
            return res.notFound(DIRECTORY_NOT_FOUND);
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
