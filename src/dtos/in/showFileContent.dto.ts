import { Static, Type } from '@sinclair/typebox';

export const ShowFileQueryStrings = Type.Object({
    path: Type.String()
});

export type ShowFileQueryStrings = Static<typeof ShowFileQueryStrings>;
