export const normalizePath = (path: string) => {
    let normalizedPath = path.replace(/['"]/g, '');

    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }

    if (normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }

    return normalizedPath;
};
