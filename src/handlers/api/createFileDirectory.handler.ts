import { logger } from '@configs';
import { CreateFileDirectoryBody } from '@dtos/in';
import { CreateFileDirectoryResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const createFileDirectory: Handler<CreateFileDirectoryResult, { Body: CreateFileDirectoryBody }> = async (req, res) => {
    const { path: newPath, data } = req.body;

    const isValidPath = /^[a-zA-Z0-9 _/-]+$/.test(newPath || '') && newPath.startsWith('/');
    if (!isValidPath) {
        return res.badRequest(`Invalid path: ${newPath}`);
    }

    try {
        const existingPathResult: { path: string }[] = await prisma.$queryRaw`
            SELECT path
            FROM File 
            WHERE (path LIKE CONCAT(${newPath}, '%')) OR 
            (type = ${FileType.RAW_FILE} AND ${newPath} LIKE CONCAT(path, '%'))`;

        if (existingPathResult.length > 0) {
            const existingPath = newPath.length > existingPathResult[0].path.length ? existingPathResult[0].path : newPath;

            return res.badRequest(`File or directory already exists at path: ${existingPath}`);
        }

        if (data)
            await prisma.file.create({
                data: {
                    path: newPath,
                    type: FileType.RAW_FILE,
                    Content: {
                        create: {
                            data: data
                        }
                    }
                }
            });
        else
            await prisma.file.create({
                data: {
                    path: newPath,
                    type: FileType.DIRECTORY
                }
            });

        return res.send({ message: `Successfully create ${data ? 'file' : 'directory'}` });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
