import { Static, Type } from '@sinclair/typebox';

export const ChangeDirectoryParams = Type.Object({
    path: Type.String({ minLength: 1 })
});

export type ChangeDirectoryParams = Static<typeof ChangeDirectoryParams>;
