import {
    changeDirectory,
    createFileDirectory,
    listDirectoryItems,
    removeFileDirectory,
    showFileContent,
    updateFileDirectory
} from '@handlers';
import { PathQueryStrings, CreateFileDirectoryBody, UpdateFileDirectoryBody, RemoveFileDirectory } from '@dtos/in';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';
import { DIRECTORY_NOT_FOUND, FILE_NOT_FOUND } from '@constants';
import { SingleMessageResult, CreateFileDirectoryResult, ShowFileContentResult, ListDirectoryItem } from '@dtos/out';

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
            summary: 'Create new file or directory',
            body: CreateFileDirectoryBody,
            response: {
                200: CreateFileDirectoryResult,
                400: Type.Object({ message: Type.String() })
            }
        },
        handler: createFileDirectory
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
        method: 'POST',
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
