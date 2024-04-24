import { Static, Type } from '@sinclair/typebox';

export const ChangeDirectoryResult = Type.Object({
    message: Type.String({ default: 'Successfully change directory' })
});

export type ChangeDirectoryResult = Static<typeof ChangeDirectoryResult>;
