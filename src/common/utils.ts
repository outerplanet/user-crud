export const checkForUniqueQueryError = (err: Record<string, unknown>): boolean => err.code === 'P2002';
