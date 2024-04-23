import { logger } from '@configs';
import { PATH_NOT_FOUND } from '@constants';
import { ChangeDirectoryDto } from '@dtos/in';
import { RawHandler } from '@interfaces';
import { prisma } from '@repositories';

export const changeDirectory: RawHandler<null, { Params: ChangeDirectoryDto }> = async (req, res) => {
    const path = req.params.path;

    try {
        const file = await prisma.file.findFirst({
            where: {
                path: { startsWith: path }
            }
        });

        if (file) {
            return null;
        } else {
            return res.badRequest(PATH_NOT_FOUND);
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
