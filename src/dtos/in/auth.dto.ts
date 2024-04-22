import { MIN_PASSWORD_LENGTH } from '@constants';
import { Static, Type } from '@sinclair/typebox';

export const LoginDto = Type.Object({
    usernameOrEmail: Type.String({ minLength: 4 }),
    password: Type.String({ minLength: MIN_PASSWORD_LENGTH })
});
export type LoginDto = Static<typeof LoginDto>;

export const SignupDto = Type.Object({
    email: Type.Optional(Type.String({ format: 'email' })),
    username: Type.String({ minLength: 4 }),
    password: Type.String({ minLength: MIN_PASSWORD_LENGTH }),
    firstName: Type.String(),
    lastName: Type.String()
});
export type SignupDto = Static<typeof SignupDto>;
