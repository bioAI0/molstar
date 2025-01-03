import fs from 'fs';
// If `converter` is a default export, do:
//   import converter from './converter';
// If it's named exports (e.g., export function makeHtml), you might do:
import * as converter from './converter';

const MAXSIZE = 1000000;

/**
 * Reads a Markdown file, processes it, and returns the HTML output.
 *
 * @param absolutePath - The absolute path to the file to read.
 * @returns The converted HTML string if successful, or `false` if the file does not exist.
 */
export function getMarkdownFile(absolutePath: string): string | false {
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
        const fd = fs.openSync(absolutePath, 'r');
        const buffer = Buffer.alloc(MAXSIZE);
        const bytesRead = fs.readSync(fd, buffer, 0, MAXSIZE, 0);
        fs.closeSync(fd);

        const data = buffer.toString('utf8', 0, bytesRead);

        // Split the data into lines
        const lines = data.split('\n');
        let processedData = '';

        for (const line of lines) {
            // Stop processing when a line with 42 "-" characters is found
            if (line.trim() === '-'.repeat(42)) {
                break;
            }
            processedData += line + '\n';
        }

        const out = converter.makeHtml(processedData);
        return out;
    } else {
        return false;
    }
}
