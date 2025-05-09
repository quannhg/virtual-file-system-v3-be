import { Static, Type } from '@sinclair/typebox';

export const FindFileDirectoryQueryStrings = Type.Object(
    {
        keyString: Type.String(),
        path: Type.String(),
        contentSearch: Type.Optional(Type.String()) // 👈 Thêm dòng này
    },
    {
        examples: [
            {
                keyString: 'Example',
                path: '/',
                contentSearch: 'optional content'
            }
        ]
    }
);

export type FindFileDirectoryQueryStrings = Static<typeof FindFileDirectoryQueryStrings>;
