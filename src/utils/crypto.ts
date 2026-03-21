/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (will be hex encoded, so output is 2x length)
 */
export function generateSecureToken(length: number = 32): string {
  // Lazy import to avoid loading native module at app start
  const Crypto = require('expo-crypto');
  const array = new Uint8Array(length);
  const randomBytes = Crypto.getRandomBytes(length);
  randomBytes.forEach((byte: number, index: number) => {
    array[index] = byte;
  });
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
