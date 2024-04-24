import { Static, Type } from '@sinclair/typebox';

export const ListDirectoryItems = Type.Array(
    Type.Object({
        name: Type.String(),
        createAt: Type.Date(),
        size: Type.Integer()
    })
);

export type ListDirectoryItems = Static<typeof ListDirectoryItems>;
