import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Get the directory name of the current module, compatible with both ESM and CommonJS
 * @param importMetaUrl - import.meta.url (only available in ESM)
 * @returns The directory path of the current module
 */
export function getDirname(importMetaUrl?: string): string {
    if (importMetaUrl) {
        // ESM: use import.meta.url
        return path.dirname(fileURLToPath(importMetaUrl));
    } else if (typeof __dirname !== 'undefined') {
        // CommonJS: use __dirname
        return __dirname;
    } else {
        // Fallback: use process.cwd() (less accurate but prevents crashes)
        console.warn('Warning: Unable to determine module directory, using process.cwd()');
        return process.cwd();
    }
}

/**
 * Get the filename of the current module, compatible with both ESM and CommonJS
 * @param importMetaUrl - import.meta.url (only available in ESM)
 * @returns The file path of the current module
 */
export function getFilename(importMetaUrl?: string): string {
    if (importMetaUrl) {
        // ESM: use import.meta.url
        return fileURLToPath(importMetaUrl);
    } else if (typeof __filename !== 'undefined') {
        // CommonJS: use __filename
        return __filename;
    } else {
        // Fallback
        console.warn('Warning: Unable to determine module filename');
        return '';
    }
}
