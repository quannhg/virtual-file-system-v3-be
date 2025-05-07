import { logger } from '@configs';
import { redisConfig } from '@configs/redis';
import { FILE_NOT_FOUND, PATH_IS_REQUIRED } from '@constants';
import { PathQueryStrings } from '@dtos/in';
import { ShowFileContentResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { normalizePath, getCache, setCache, cacheKeys } from '@utils';

export const showFileContent: Handler<ShowFileContentResult, { Querystring: PathQueryStrings }> = async (req, res) => {
    const rawPath = req.query.path;
    if (!rawPath) {
        return res.unprocessableEntity(PATH_IS_REQUIRED);
    }

    const normalizeResult = await normalizePath(rawPath, true);
    if (normalizeResult.invalid) {
        return res.badRequest(normalizeResult.message);
    }
    const path = normalizeResult.path;

    try {
        const cacheKey = cacheKeys.fileContent(path);
        const cachedContent = await getCache<ShowFileContentResult>(cacheKey);

        if (cachedContent) {
            return res.status(200).send(cachedContent);
        }

        // Step 1: Get file metadata from File model (not Content)
        const fileMeta = await prisma.file.findUnique({
            where: { path },
            select: {
                type: true,
                targetPath: true
            }
        });

        if (!fileMeta) {
            return res.status(400).send({ message: FILE_NOT_FOUND });
        }

        // If it's a symlink, use targetPath to query content
        const actualPath = fileMeta.type === 'SYMLINK' && fileMeta.targetPath
            ? fileMeta.targetPath
            : path;

        // Step 2: Query data from Content using actualPath
        const fileContent = await prisma.content.findUnique({
            where: { path: actualPath },

            select: {
                data: true
            }
        });

        if (!fileContent) {
            return res.status(400).send({ message: FILE_NOT_FOUND });
        }

        // Return structured response with file information
        const file = res.status(200).send({
            data: fileContent.data,
            type: fileMeta.type,
            isSymlink: fileMeta.type === 'SYMLINK',
            targetPath: fileMeta.targetPath ?? null
        });

        await setCache(cacheKey, file, redisConfig.ttl.fileContent);
        return res.status(200).send(file);
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};