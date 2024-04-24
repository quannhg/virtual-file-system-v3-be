import { changeDirectory } from '@handlers';
import { ChangeDirectoryParams } from '@dtos/in';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';
import { PATH_NOT_FOUND } from '@constants';
import { ChangeDirectoryResult } from '@dtos/out';

export const apiRoute = createRoute('Api', [
    {
        method: 'GET',
        url: '/cd',
        schema: {
            summary: 'Change current directory',
            querystring: ChangeDirectoryParams,
            response: {
                200: ChangeDirectoryResult,
                400: Type.Object({ message: Type.String({ default: PATH_NOT_FOUND }) })
            }
        },
        handler: changeDirectory
    }
]);
