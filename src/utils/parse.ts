/**
 * Strips the protocol (http://, https://, or any protocol://) from a URL
 * @param url - The URL string to process
 * @returns The URL without the protocol prefix
 */
export const stripProtocol = (url: string): string => {
    return url.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
};
