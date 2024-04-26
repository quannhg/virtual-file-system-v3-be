export const cleanPath = (path: string) => {
    let cleanedPath = path.replace(/\/+$/, '/');

    if (!cleanedPath.startsWith('/')) {
        cleanedPath = '/' + cleanedPath;
    }

    if (cleanedPath !== '/' && cleanedPath.endsWith('/')) {
        cleanedPath = cleanedPath.slice(0, -1);
    }

    return cleanedPath;
};
