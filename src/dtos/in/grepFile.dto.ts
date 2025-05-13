import { Static, Type } from '@sinclair/typebox';

export const GrepFileQueryStrings = Type.Object(
  {
    path: Type.Optional(Type.String()),
    contentSearch: Type.String()
  },
  {
    examples: [
      {
        path: '/',
        contentSearch: 'error'
      }
    ]
  }
);

export type GrepFileQueryStrings = Static<typeof GrepFileQueryStrings>;
