import { Static, Type } from '@sinclair/typebox';

export const ShowFileContentResult = Type.Object({
    name: Type.String(),
});

export type ShowFileContentResult = Static<typeof ShowFileContentResult>;
