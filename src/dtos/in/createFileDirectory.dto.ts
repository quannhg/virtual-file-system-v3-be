import { Nullable } from '@dtos/common';
import { Static, Type } from '@sinclair/typebox';
import { FileType } from '@prisma/client';

// Tạo enum FileType cho TypeBox (nếu chưa có)

export const CreateFileDirectoryBody = Type.Object({
    path: Type.String(),
    shouldCreateParent: Type.Optional(Type.Boolean()),
    data: Type.Optional(Nullable(Type.String())),
    type: Type.Optional(Type.Enum(FileType)),
    targetPath: Type.Optional(Type.String()),

     // Thêm field mới để hỗ trợ flag symlink
    ln: Type.Optional(Type.Boolean({ default: false }))
});

export type CreateFileDirectoryBody = Static<typeof CreateFileDirectoryBody>;