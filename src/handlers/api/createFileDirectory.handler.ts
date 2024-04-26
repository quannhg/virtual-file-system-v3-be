import { logger } from '@configs';
import { CreateFileDirectoryBody } from '@dtos/in';
import { CreateFileDirectoryResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { checkExistingPath } from 'src/utils/checkExistingPath';
import { cleanPath, validatePath } from '@utils';

export const createFileDirectory: Handler<CreateFileDirectoryResult, { Body: CreateFileDirectoryBody }> = async (req, res) => {
    const { path: receivedPath, data } = req.body;

    const newPath = cleanPath(receivedPath);

    const validatePathResult = validatePath(newPath);
    if (!validatePathResult.valid) {
        return res.badRequest(validatePathResult.message);
    }

    try {
        const existingPath = await checkExistingPath(newPath);
        if (existingPath) {
            return res.badRequest(`File or directory already exists at path: ${existingPath}`);
        }

        const removeEmptyFolder = prisma.$executeRaw`
            DELETE FROM File
            WHERE ${newPath} LIKE CONCAT(path, '/', '%')
            AND type = ${FileType.DIRECTORY}
        `;

        await prisma.$transaction([
            removeEmptyFolder,
            data
                ? prisma.file.create({
                      data: {
                          path: newPath,
                          type: FileType.RAW_FILE,
                          Content: {
                              create: {
                                  data: data
                              }
                          }
                      }
                  })
                : prisma.file.create({
                      data: {
                          path: newPath,
                          type: FileType.DIRECTORY
                      }
                  })
        ]);

        return res.send({ message: `Successfully create ${data ? 'file' : 'directory'}` });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
