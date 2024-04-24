import { changeDirectory } from '@handlers';
// import { ChangeDirectoryDto } from '@dtos/in';
import { createRoute } from '@utils';
import { Type } from '@sinclair/typebox';
import { PATH_NOT_FOUND } from '@constants';

export const apiRoute = createRoute('Api', [
    {
        method: 'GET',
        url: '/cd/:path',
        schema: {
            summary: 'Change current directory',
            params: {
                type: 'object',
                properties: {
                    path: { type: 'string' }
                },
                required: ['path']
            },
            response: {
                200: Type.Null(),
                400: Type.Object({ message: Type.String({ default: PATH_NOT_FOUND }) })
            }
        },
        handler: changeDirectory
    }
]);
