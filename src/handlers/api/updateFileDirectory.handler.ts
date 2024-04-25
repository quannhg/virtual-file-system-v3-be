import { logger } from '@configs';
import { FILE_OR_DIRECTORY_NOT_FOUND } from '@constants';
import { UpdateFileDirectoryBody } from '@dtos/in';
import { SingleMessageResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const updateFileDirectory: Handler<SingleMessageResult, { Body: UpdateFileDirectoryBody }> = async (req, res) => {
    const { oldPath, newPath, newData } = req.body;

    try {
        const existingFile = await prisma.file.findUnique({
            where: {
                path: oldPath
            }
        });

        if (!existingFile) {
            return res.notFound(FILE_OR_DIRECTORY_NOT_FOUND);
        }

        const updateItem = await prisma.file.update({
            where: {
                path: oldPath
            },
            data: {
                path: newPath
            },
            select: {
                type: true
            }
        });

        if (newData && updateItem.type === FileType.RAW_FILE) {
            await prisma.content.updateMany({
                where: {
                    path: newPath
                },
                data: {
                    data: newData
                }
            });
        } else if (newData) {
            return res.badRequest('Cannot update data for a directory');
        }

        return res.send({ message: 'Successfully updated file/directory' });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
