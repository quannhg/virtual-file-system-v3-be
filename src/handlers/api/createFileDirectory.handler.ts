import { logger } from '@configs';
import { CreateFileDirectoryBody } from '@dtos/in';
import { CreateFileDirectoryResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';

export const createFileDirectory: Handler<CreateFileDirectoryResult, { Body: CreateFileDirectoryBody }> = async (req, res) => {
    const { path, data } = req.body;

    const isValidPath = /^[a-zA-Z0-9 _/-]+$/.test(path || '') && path.startsWith('/');
    if (!isValidPath) {
        return res.status(400).send({ message: `Invalid path: ${path}` });
    }

    try {
        const fileType = data ? FileType.RAW_FILE : FileType.DIRECTORY;

        const existingFile = await prisma.file.findUnique({
            where: {
                path_type: {
                    path: path,
                    type: fileType
                }
            }
        });

        if (existingFile) {
            return res.status(400).send({ message: `File or directory already exists at path: ${path}` });
        }

        if (data)
            await prisma.file.create({
                data: {
                    path: path,
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
                    path: path,
                    type: FileType.DIRECTORY
                }
            });

        return res.send({ message: `Successfully create ${data ? 'file' : 'directory'}` });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
