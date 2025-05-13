import { logger } from '@configs';
import { DIRECTORY_NOT_FOUND } from '@constants';
import { GrepFileQueryStrings } from '@dtos/in';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { normalizePath } from '@utils';

export const grepFiles: Handler<
  { path: string; content: string }[],
  { Querystring: GrepFileQueryStrings }
> = async (req, res) => {
  const { contentSearch, path: rawPath = '/' } = req.query;

  if (!contentSearch?.trim()) {
    return res.status(400).send({ message: 'Content search string is required' });
  }

  const normalizeResult = await normalizePath(rawPath);
  if (normalizeResult.invalid) {
    return res.status(400).send({ message: 'Invalid path' });
  }

  const pathPrefix = normalizeResult.path.endsWith('/')
    ? normalizeResult.path
    : `${normalizeResult.path}/`;

  try {
    const folderExists = await prisma.file.findFirst({
      where: {
        OR: [
          { path: pathPrefix.slice(0, -1), type: FileType.DIRECTORY },
          { path: { startsWith: pathPrefix } }
        ]
      }
    });

    if (!folderExists) {
      return res.status(400).send({ message: DIRECTORY_NOT_FOUND });
    }

    const matchingFiles = await prisma.file.findMany({
      where: {
        path: {
          startsWith: pathPrefix
        },
        type: FileType.RAW_FILE,
        content: {
          data: {
            contains: contentSearch
          }
        }
      },
      select: {
        path: true,
        content: true
      }
    });

    return res.status(200).send(
        matchingFiles.map((file) => ({
          path: file.path,
          content: file.content?.data || ''
        }))
      );
  } catch (err) {
    logger.error('Error in grepFiles:', {
      error: err,
      query: { path: rawPath, contentSearch }
    });
    return res.status(500).send({ message: 'Internal server error' });
  }
};
