import { Static, Type } from '@sinclair/typebox';

export const ChangeDirectoryDto = Type.Object({
    path: Type.String()
});
export type ChangeDirectoryDto = Static<typeof ChangeDirectoryDto>;
