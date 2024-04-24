import { Static, Type } from '@sinclair/typebox';

export const ChangeDirectoryParams = Type.Object({
    path: Type.String()
});

export type ChangeDirectoryParams = Static<typeof ChangeDirectoryParams>;
