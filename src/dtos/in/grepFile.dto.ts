import { Static, Type } from '@sinclair/typebox';

export const GrepFileQueryStrings = Type.Object(
    {
        keyString: Type.String(),
        path: Type.String(),
        contentSearch: Type.Optional(Type.String())
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

export type GrepFileQueryStrings = Static<typeof GrepFileQueryStrings>;
