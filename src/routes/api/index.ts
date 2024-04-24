import { changeDirectory, createFileDirectory } from '@handlers';
import { ChangeDirectoryQueryStrings } from '@dtos/in';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';
import { PATH_NOT_FOUND } from '@constants';
import { ChangeDirectoryResult } from '@dtos/out';
import { CreateFileDirectoryBody } from 'src/dtos/in/createFileDirectory.dto';
import { CreateFileDirectoryResult } from 'src/dtos/out/createFileDirectory.dto';

export const apiRoute = createRoute('Api', [
    {
        method: 'GET',
        url: '/cd',
        schema: {
            summary: 'Change current directory',
            querystring: ChangeDirectoryQueryStrings,
            response: {
                200: ChangeDirectoryResult,
                400: Type.Object({ message: Type.String({ default: PATH_NOT_FOUND }) })
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
    }
]);
