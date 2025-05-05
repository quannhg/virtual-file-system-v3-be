import {
    changeDirectory,
    createFileDirectory,
    findDirectoryItems,
    listDirectoryItems,
    moveFileDirectory,
    removeFileDirectory,
    showFileContent,
    updateFileDirectory
} from '@handlers';
import {
    PathQueryStrings,
    CreateFileDirectoryBody,
    UpdateFileDirectoryBody,
    RemoveFileDirectory,
    MoveFileDirectoryBody,
    FindFileDirectoryQueryStrings
} from '@dtos/in';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';
import { DIRECTORY_NOT_FOUND, FILE_NOT_FOUND } from '@constants';
import { SingleMessageResult, CreateFileDirectoryResult, ShowFileContentResult, ListDirectoryItem } from '@dtos/out';
import { FileType } from '@prisma/client';

export const apiRoute = createRoute('Api', [
    {
        method: 'GET',
        url: '/cd',
        schema: {
            summary: 'Change current directory',
            querystring: PathQueryStrings,
            response: {
                200: SingleMessageResult,
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: changeDirectory
    },
    {
        method: 'POST',
        url: '/cr',
        schema: {
            summary: 'Create new file, directory, or symlink',
            body: CreateFileDirectoryBody,
            response: {
                200: CreateFileDirectoryResult,
                400: Type.Object({ message: Type.String() })
            }
        },
        handler: createFileDirectory
    },
    {
        method: 'POST',
        url: '/ln',
        schema: {
            summary: 'Create symbolic link',
            body: Type.Object({
                targetPath: Type.String(),
                path: Type.String(),
                shouldCreateParent: Type.Optional(Type.Boolean({ default: false }))
            }),
            response: {
                200: SingleMessageResult,
                400: Type.Object({ message: Type.String() })
            }
        },
        handler: async (req, res) => {
            // Sửa request để sử dụng lại handler createFileDirectory
            req.body.type = FileType.SYMLINK;
            return createFileDirectory(req, res);
        }
    },
    {
        method: 'GET',
        url: '/cat',
        schema: {
            summary: 'Retrieve content of the file',
            querystring: PathQueryStrings,
            response: {
                200: ShowFileContentResult,
                400: Type.Object({ message: Type.String({ default: FILE_NOT_FOUND }) })
            }
        },
        handler: showFileContent
    },
    {
        method: 'GET',
        url: '/ls',
        schema: {
            summary: 'List all items in directory',
            querystring: PathQueryStrings,
            response: {
                200: Type.Array(ListDirectoryItem),
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: listDirectoryItems
    },
    {
        method: 'GET',
        url: '/find',
        schema: {
            summary: 'Find all items in directory',
            querystring: FindFileDirectoryQueryStrings,
            response: {
                200: Type.Array(Type.String()),
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: findDirectoryItems
    },
    {
        method: 'PUT',
        url: '/up',
        schema: {
            summary: 'Update file or directory',
            body: UpdateFileDirectoryBody,
            response: {
                200: SingleMessageResult,
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: updateFileDirectory
    },
    {
        method: 'PUT',
        url: '/mv',
        schema: {
            summary: 'Move files or directories',
            body: MoveFileDirectoryBody,
            response: {
                200: SingleMessageResult,
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: moveFileDirectory
    },
    {
        method: 'DELETE',
        url: '/rm',
        schema: {
            summary: 'Remove files or directories',
            querystring: RemoveFileDirectory,
            response: {
                200: SingleMessageResult,
                400: Type.Object({ message: Type.String({ default: DIRECTORY_NOT_FOUND }) })
            }
        },
        handler: removeFileDirectory
    }
]);
