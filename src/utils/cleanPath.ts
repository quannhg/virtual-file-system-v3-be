export const cleanPath = (path: string) => {
    let cleanedPath = path.trim();

    cleanedPath = cleanedPath.replace(/\/+$/, '/');

    if (!cleanedPath.startsWith('/')) {
        cleanedPath = '/' + cleanedPath;
    }

    if (cleanedPath !== '/' && cleanedPath.endsWith('/')) {
        cleanedPath = cleanedPath.slice(0, -1);
    }

    return cleanedPath;
};
