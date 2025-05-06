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
        // Try to get from cache first
        const cacheKey = cacheKeys.fileContent(path);
        const cachedContent = await getCache<ShowFileContentResult>(cacheKey);

        if (cachedContent) {
            return res.status(200).send(cachedContent);
        }

        // If not in cache, get from database
        const file = await prisma.content.findFirst({
            where: {
                path
            },
            select: {
                data: true
            }
        });

        if (file) {
            // Cache the result before returning
            await setCache(cacheKey, file, redisConfig.ttl.fileContent);
            return res.status(200).send(file);
        } else {
            return res.status(400).send({ message: FILE_NOT_FOUND });
        }
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};
