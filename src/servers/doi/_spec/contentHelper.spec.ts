import fs from 'fs';
import path from 'path';
// If `converter` is a default export, do:
//   import converter from '../src/doi/converter';
// If it's a named export, for example, `export function makeHtml`, do:
import * as converter from '../converter';

// Same for `contentHelper`
import * as contentHelper from '../contentHelper';

const MAXSIZE = 1000000;

describe('contentHelper', () => {
    it('should return false if the file does not exist', () => {
        const result = contentHelper.getMarkdownFile('./nonExistentFile.txt');
        expect(result).toBe(false);
    });

    it('should get a file and convert its content to HTML', () => {
        const testFilePath = path.join(__dirname, 'testFile.txt');
        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, 'test content', 'utf8');
        }

        const result = contentHelper.getMarkdownFile(testFilePath);
        expect(result).toEqual(converter.makeHtml('test content'));

        fs.unlinkSync(testFilePath);
    });

    it('should read only the first MAXSIZE characters of a file', () => {
        const testFilePath = path.join(__dirname, 'longTestFile.txt');
        const longContent = 'a'.repeat(MAXSIZE + 500);

        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, longContent, 'utf8');
        }

        // We expect the result to contain only the first MAXSIZE `a` characters (plus any trailing newlines).
        const expectedString = 'a'.repeat(MAXSIZE) + '\n';
        const result = contentHelper.getMarkdownFile(testFilePath);

        expect(result).toEqual(converter.makeHtml(expectedString));
        fs.unlinkSync(testFilePath);
    });

    it('should stop outputting the file when a line with 42 "-" characters is encountered', () => {
        const testFilePath = path.join(__dirname, 'stopLineTestFile.txt');
        const fileContent = `line 1\nline 2\n${'-'.repeat(42)}\nline 4\nline 5`;

        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, fileContent, 'utf8');
        }

        const expectedContent = `line 1\nline 2\n`; // Content before the line of 42 "-"
        const result = contentHelper.getMarkdownFile(testFilePath);
        expect(result).toEqual(converter.makeHtml(expectedContent));

        fs.unlinkSync(testFilePath);
    });
});


