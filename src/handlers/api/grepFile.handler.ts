import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND } from '@constants';
import { GrepFileQueryStrings } from '@dtos/in';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { normalizePath } from '@utils';

export const grepFiles: Handler<string[], { Querystring: GrepFileQueryStrings }> = async (req, res) => {
    const { keyString, path: rawPath = '/', contentSearch } = req.query;

    const normalizeResult = await normalizePath(rawPath);
    if (normalizeResult.invalid) {
        return res.status(400).send({ message: 'Invalid path' });
    }

    const pathPrefix = normalizeResult.path.endsWith('/') ? normalizeResult.path : `${normalizeResult.path}/`;

    try {
        // ❗ Check nếu path là file thì từ chối
        const exactFile = await prisma.file.findFirst({
            where: {
                path: pathPrefix.slice(0, -1),
                type: FileType.RAW_FILE
            }
        });

        if (exactFile) {
            return res.status(400).send({ message: 'Path must refer to a directory, not a file' });
        }

        // ✅ Nếu không có thư mục hoặc file con nào, báo lỗi
        const folderExists = await prisma.file.findFirst({
            where: {
                OR: [{ path: pathPrefix.slice(0, -1), type: FileType.DIRECTORY }, { path: { startsWith: pathPrefix } }]
            }
        });

        if (!folderExists) {
            return res.status(400).send({ message: DIRECTORY_NOT_FOUND });
        }

        // ✅ Truy vấn lồng nhau: Tìm file thỏa keyString hoặc contentSearch
        const matchingFiles = await prisma.file.findMany({
            where: {
                path: {
                    startsWith: pathPrefix
                },
                type: FileType.RAW_FILE,
                OR: [
                    keyString
                        ? {
                              name: {
                                  contains: keyString
                              }
                          }
                        : undefined,
                    contentSearch
                        ? {
                              content: {
                                  data: {
                                      contains: contentSearch
                                  }
                              }
                          }
                        : undefined
                ].filter(Boolean) // bỏ undefined
            },
            select: {
                path: true,
                name: true
            }
        });

        // ✅ Trả về path + name chính xác
        const paths = matchingFiles.map((file) => `${file.path}/${file.name}`);
        return res.status(200).send(paths);
    } catch (err) {
        logger.error('Error in grepFiles:', {
            error: err,
            query: { keyString, path: rawPath, contentSearch }
        });
        return res.status(500).send({ message: 'An internal server error occurred. Please try again later.' });
    }
};
