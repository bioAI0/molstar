const fs = require('fs');
const converter = require('./converter');

const MAXSIZE = 1000000;

function getMarkdownFile(absolutePath) {
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
            if (line.trim() === '-'.repeat(42)) {
                break; // Stop processing when a line with 42 "-" characters is found
            }
            processedData += line + '\n';
        }

        const out = converter.makeHtml(processedData);
        return out;
    } else {
        return false;
    }
}

module.exports = {
    getMarkdownFile
};
