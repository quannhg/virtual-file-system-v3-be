import { logger } from '@configs';
import { CreateFileDirectoryBody } from '@dtos/in';
import { CreateFileDirectoryResult } from '@dtos/out';
import { Handler } from '@interfaces';
import { FileType } from '@prisma/client';
import { prisma } from '@repositories';
import { checkExistingPath } from 'src/utils/checkExistingPath';
import { getParentPath, normalizePath, invalidateDirectoryCache, invalidateFileCache } from '@utils';
import { PATH_IS_REQUIRED } from '@constants';

export const createFileDirectory: Handler<CreateFileDirectoryResult, { Body: CreateFileDirectoryBody }> = async (req, res) => {
    const { path: rawPath, shouldCreateParent, data, type, targetPath } = req.body;

    if (!rawPath) {
        return res.unprocessableEntity(PATH_IS_REQUIRED);
    }

    // Kiểm tra type nếu là SYMLINK thì cần có targetPath
    if (type === FileType.SYMLINK && !targetPath) {
        return res.unprocessableEntity('Target path is required for SYMLINK');
    }

    const normalizeResult = await normalizePath(rawPath, data !== null ? data?.length !== 0 : false);
    if (normalizeResult.invalid) {
        return res.badRequest(normalizeResult.message);
    }
    const newPath = normalizeResult.path;

    try {
        if (!shouldCreateParent) {
            const parentPath = getParentPath(newPath);
            const parentItem = await prisma.file.findFirst({
                where: { OR: [{ path: parentPath, type: FileType.DIRECTORY }, { path: { startsWith: parentPath + '/' } }] }
            });

            if (!parentItem) return res.badRequest(`The specified parent item with path "${parentPath}" does not exist.`);
        }

        const existingPath = await checkExistingPath(newPath);
        if (existingPath) {
            return res.badRequest(`File or directory already exists at path: ${existingPath}`);
        }

        // Xác định loại file cần tạo
        let fileType = type;
        if (!fileType) {
            fileType = data ? FileType.RAW_FILE : FileType.DIRECTORY;
        }

        // Tạo file/directory/symlink tùy theo loại
        if (fileType === FileType.SYMLINK) {
            // Kiểm tra xem targetPath có tồn tại không
            const targetExists = await prisma.file.findUnique({
                where: { path: targetPath }
            });
            
            if (!targetExists) {
                return res.badRequest(`Target path "${targetPath}" does not exist`);
            }

            await prisma.file.create({
                data: {
                    path: newPath,
                    type: FileType.SYMLINK,
                    targetPath: targetPath
                }
            });
        } else if (fileType === FileType.RAW_FILE && data) {
            await prisma.file.create({
                data: {
                    path: newPath,
                    type: FileType.RAW_FILE,
                    Content: {
                        create: {
                            data
                        }
                    }
                }
            });
        } else {
            await prisma.file.create({
                data: {
                    path: newPath,
                    type: FileType.DIRECTORY
                }
            });
        }
        
        
        
        // Invalidate cache for the parent directory to ensure ls shows the new file/directory
        const parentPath = getParentPath(newPath);
        await invalidateDirectoryCache(parentPath);
        
        // If this is a file, also invalidate its content cache (though it's likely not cached yet)
        if (data) {
            await invalidateFileCache(newPath);
        }
        
        return res.send({ message: `Successfully created ${fileType.toLowerCase()}` });
        // return res.send({ message: `Successfully create ${data ? 'file' : 'directory'}` });
    } catch (err) {
        logger.error(err);
        return res.internalServerError();
    }
};