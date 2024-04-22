import { ID_LENGTH, MIN_EMAIL_LENGTH } from '@constants';
import { TSchema, Type } from '@sinclair/typebox';

export const Id = (description?: string) =>
    Type.String({
        minLength: ID_LENGTH,
        maxLength: ID_LENGTH,
        description
    });

export const Email = (description?: string) =>
    Type.String({
        minLength: MIN_EMAIL_LENGTH,
        description
    });

export const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);
