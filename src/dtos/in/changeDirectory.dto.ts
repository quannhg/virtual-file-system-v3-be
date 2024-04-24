import { Static, Type } from '@sinclair/typebox';

export const ChangeDirectoryQueryStrings = Type.Object({
    path: Type.String()
});

export type ChangeDirectoryQueryStrings = Static<typeof ChangeDirectoryQueryStrings>;
