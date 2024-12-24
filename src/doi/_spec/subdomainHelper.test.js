const { getHost, getBasePath, getFilePath } = require('../src/doi/subdomainHelper');
const prefix = 'vaults/';

describe('getHost', () => {
    it('should return "root" if req.vhost[0] is undefined', () => {
        const req = { vhost: [undefined] };
        expect(getHost(req)).toBe('root');
    });

    it('should return the value of req.vhost[0] if it is defined', () => {
        const req = { vhost: ['subdomain'] };
        expect(getHost(req)).toBe('subdomain');
    });
});

describe('getBasePath', () => {
    it('should return "sness/" when req.hostname is "sness.doi.bio"', () => {
        const req = { hostname: 'sness.doi.bio' };
        const host = 'anything';
        expect(getBasePath(req, host)).toBe(prefix + 'sness/');
    });

    it('should return "mchr1/" when req.hostname is "mchr1.doi.bio"', () => {
        const req = { hostname: 'mchr1.doi.bio' };
        const host = 'anything';
        expect(getBasePath(req, host)).toBe(prefix + 'mchr1/');
    });

    it('should return "doi/" when host is "root"', () => {
        const req = { hostname: 'any.other.host' };
        const host = 'root';
        expect(getBasePath(req, host)).toBe(prefix + 'doi/');
    });

    it('should return "{host}/" when host is neither "root" nor a specific hostname', () => {
        const req = { hostname: 'random.host' };
        const host = 'customhost';
        expect(getBasePath(req, host)).toBe(prefix + 'customhost/');
    });
});


describe('getFilePath', () => {
    it('should return the basePath with "root.md" when req.path is "/"', () => {
        const req = { path: '/' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/root.md');
    });

    it('should return the basePath with "root.md" when req.path is an empty string', () => {
        const req = { path: '' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/root.md');
    });

    it('should append the decoded req.path to the basePath', () => {
        const req = { path: '/testPath' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testPath.md');
    });

    it('should handle URL-encoded paths correctly', () => {
        const req = { path: '/encoded%20path' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/encoded path.md');
    });

    it('should return the basePath unchanged when the file path ends with .pdf', () => {
        const req = { path: '/testFile.pdf' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testFile.pdf');
    });

    it('should return the basePath with ".md" when the file path ends with anything other than .pdf', () => {
        const req = { path: '/testFile' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testFile.md');  // typical case

        const req2 = { path: '/encoded%20path' };
        const basePath2 = 'example/';
        expect(getFilePath(req2, basePath2)).toBe('example/encoded path.md');  // encoded path
    });

    describe('getFilePath', () => {
    it('should return the basePath unchanged when the file path ends with .pdf', () => {
        const req = { path: '/testFile.pdf' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testFile.pdf');  // Testing .pdf case
    });

    it('should return the basePath unchanged when the file path ends with .json', () => {
        const req = { path: '/testFile.json' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testFile.json');  // Testing .json case
    });

    it('should append .md when the file path does not end with .pdf or .json', () => {
        const req = { path: '/testFile' };
        const basePath = 'example/';
        expect(getFilePath(req, basePath)).toBe('example/testFile.md');  // testing typical case without pdf/json extensions
    });
});

});
