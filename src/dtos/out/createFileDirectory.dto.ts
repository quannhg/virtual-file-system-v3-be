import { Static, Type } from '@sinclair/typebox';

export const CreateFileDirectoryResult = Type.Object({
    message: Type.String({ default: 'Successfully create file/directory' })
});

export type CreateFileDirectoryResult = Static<typeof CreateFileDirectoryResult>;
