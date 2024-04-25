import { logger } from '@configs';
import { RemoveFileDirectory } from '@dtos/in';
import { SingleMessageResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { cleanPath, getLastSegment } from '@utils';

export const removeFileDirectory: Handler<SingleMessageResult, { Querystring: RemoveFileDirectory }> = async (req, res) => {
    try {
        const paths = req.query.paths;
        const errorMessages = [];

        for (const path of paths) {
            const removePath = cleanPath(path);

            const firstRemoveItem = await prisma.file.findFirst({
                where: {
                    OR: [{ path: { startsWith: removePath + '/' } }, { path: removePath }]
                }
            });
            if (!firstRemoveItem) {
                errorMessages.push(`Cannot remove ${getLastSegment(path)}: File/directory not found`);
                continue;
            }

            await prisma.$transaction([
                prisma.content.deleteMany({
                    where: {
                        OR: [{ path: { startsWith: removePath + '/' } }, { path: removePath }]
                    }
                }),
                prisma.file.deleteMany({
                    where: {
                        OR: [{ path: { startsWith: removePath + '/' } }, { path: removePath }]
                    }
                })
            ]);
        }

        if (errorMessages.length === 0) {
            return res.send({ message: 'Successfully deleted files/directories' });
        } else {
            const errorMessage = errorMessages.join('\n');
            return res.badRequest(errorMessage);
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
