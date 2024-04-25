import { Static, Type } from '@sinclair/typebox';

export const ListDirectoryItem = Type.Object({
    name: Type.String(),
    createAt: Type.Date(),
    size: Type.Integer()
});

export type ListDirectoryItem = Static<typeof ListDirectoryItem>;
