import { logger } from '@configs';
import { FILE_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { ShowFileQueryStrings } from '@dtos/in';
import { ShowFileContentResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { prisma } from '@repositories';

export const showFileContent: Handler<ShowFileContentResult, { Querystring: ShowFileQueryStrings }> = async (req, res) => {
    const path = req.query.path;

    if (!path) {
        return res.status(400).send({ error: PATH_IS_REQUIRED });
    }

    try {
        const file = await prisma.content.findFirst({
            where: {
                path
            },
            select: {
                data: true
            }
        });

        if (file) {
            return res.status(200).send(file);
        } else {
            return res.status(400).send({ message: FILE_NOT_FOUND });
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
