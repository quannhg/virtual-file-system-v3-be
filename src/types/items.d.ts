type ItemWithContent = {
    path: string;
    type: 'RAW_FILE' | 'DIRECTORY' | 'SYMLINK';
    createdAt: Date;
    content: { // Changed from Content
        data: string;
    } | null; // Assuming content can be null like in prisma schema
};

type SimpleItem = {
    path: string;
    type: 'RAW_FILE' | 'DIRECTORY' | 'SYMLINK';
};
