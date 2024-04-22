import { Id, Nullable } from '@dtos/common';
import { Static, Type } from '@sinclair/typebox';

export const AuthResultDto = Type.Object({
    id: Id('User ID'),
    email: Nullable(Type.String({ format: 'email' })),
    username: Type.String()
});

export type AuthResultDto = Static<typeof AuthResultDto>;
