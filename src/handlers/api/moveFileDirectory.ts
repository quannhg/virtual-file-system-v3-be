import { logger } from '@configs';
import { MoveFileDirectoryBody } from '@dtos/in';
import { SingleMessageResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { cleanPath, getLastSegment } from '@utils';
import { appendPath } from 'src/utils/appendPath';
import { checkExistingPath } from 'src/utils/checkExistingPath';

export const moveFileDirectory: Handler<SingleMessageResult, { Body: MoveFileDirectoryBody }> = async (req, res) => {
    const { oldPath: rawOldPath, destinationPath: rawDestinationPath } = req.body;

    const destinationPath = cleanPath(rawDestinationPath);
    const oldPath = cleanPath(rawOldPath);

    try {
        const movedItems = await prisma.file.findMany({
            where: {
                OR: [{ path: { startsWith: oldPath + '/' } }, { path: oldPath }]
            },
            select: {
                path: true,
                type: true
            }
        });
        if (movedItems.length === 0) {
            return res.badRequest('Not found any item at ' + oldPath);
        }

        const firstDestinationItem = await prisma.file.findFirst({
            where: {
                OR: [{ path: { startsWith: destinationPath + '/' } }, { path: destinationPath }]
            }
        });
        if (!firstDestinationItem) return res.badRequest('Not found destination path: ' + destinationPath);

        if (destinationPath.includes(oldPath)) return res.badRequest("Can not move folder to it's sub folder");

        if (
            cleanPath(firstDestinationItem.path).length === cleanPath(destinationPath).length &&
            firstDestinationItem.type === FileType.RAW_FILE
        ) {
            return res.badRequest('Can not move item to file');
        }

        const newPath = appendPath(destinationPath, getLastSegment(oldPath));

        const existingPath = await checkExistingPath(newPath);
        if (existingPath) {
            return res.badRequest(`File or directory already exists at path: ${existingPath}`);
        }

        const removedLengthOfOldPart = oldPath.length - getLastSegment(oldPath).length - 1;

        for (let i = 0; i < movedItems.length; i++) {
            const item = movedItems[i];
            const absoluteNewPath = appendPath(destinationPath, item.path.slice(removedLengthOfOldPart, item.path.length));

            await prisma.file.update({
                where: {
                    path: item.path
                },
                data: {
                    path: absoluteNewPath
                }
            });
        }
        return res.send({ message: `Successfully moved ${oldPath} to ${destinationPath}` });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
