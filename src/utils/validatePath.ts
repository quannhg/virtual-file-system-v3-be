export function validatePath(path: string): { valid: false; message: string } | { valid: true } {
    const isValidPath = /^[a-zA-Z0-9 _/-]+$/.test(path);
    if (!isValidPath) {
        return {
            valid: false,
            message: `Invalid characters in path: ${path}. Path can only contain alphanumeric characters, spaces, underscores, hyphens, and slashes.`
        };
    }
    if (path.includes('//')) {
        return {
            valid: false,
            message: `Invalid path: ${path}. Consecutive slash characters are not allowed.`
        };
    }
    return { valid: true };
}
