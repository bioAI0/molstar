// test/subdomainHelper.test.ts
import { getHost, getBasePath, getFilePath } from '../subdomainHelper';

// Use the same prefix as in the helper file for consistency
const prefix = 'vaults/';

// Because we are testing, we'll define a minimal shape for req in the tests:
interface TestReq {
  vhost?: (string | undefined)[];
  hostname?: string;
  path: string;
}

describe('getHost', () => {
  it('should return "root" if req.vhost[0] is undefined', () => {
    const req: TestReq = { vhost: [undefined], path: '' };
    expect(getHost(req)).toBe('root');
  });

  it('should return the value of req.vhost[0] if it is defined', () => {
    const req: TestReq = { vhost: ['subdomain'], path: '' };
    expect(getHost(req)).toBe('subdomain');
  });
});

describe('getBasePath', () => {
  it('should return "sness/" when req.hostname is "sness.doi.bio"', () => {
    const req: TestReq = { hostname: 'sness.doi.bio', path: '' };
    const host = 'anything';
    expect(getBasePath(req, host)).toBe(prefix + 'sness/');
  });

  it('should return "mchr1/" when req.hostname is "mchr1.doi.bio"', () => {
    const req: TestReq = { hostname: 'mchr1.doi.bio', path: '' };
    const host = 'anything';
    expect(getBasePath(req, host)).toBe(prefix + 'mchr1/');
  });

  it('should return "doi/" when host is "root"', () => {
    const req: TestReq = { hostname: 'any.other.host', path: '' };
    const host = 'root';
    expect(getBasePath(req, host)).toBe(prefix + 'doi/');
  });

  it('should return "{host}/" when host is neither "root" nor a specific hostname', () => {
    const req: TestReq = { hostname: 'random.host', path: '' };
    const host = 'customhost';
    expect(getBasePath(req, host)).toBe(prefix + 'customhost/');
  });
});

describe('getFilePath', () => {
  it('should return the basePath with "root.md" when req.path is "/"', () => {
    const req: TestReq = { path: '/' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/root.md');
  });

  it('should return the basePath with "root.md" when req.path is an empty string', () => {
    const req: TestReq = { path: '' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/root.md');
  });

  it('should append the decoded req.path to the basePath', () => {
    const req: TestReq = { path: '/testPath' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/testPath.md');
  });

  it('should handle URL-encoded paths correctly', () => {
    const req: TestReq = { path: '/encoded%20path' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/encoded path.md');
  });

  it('should return the basePath unchanged when the file path ends with .pdf', () => {
    const req: TestReq = { path: '/testFile.pdf' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/testFile.pdf');
  });

  it('should return the basePath unchanged when the file path ends with .json', () => {
    const req: TestReq = { path: '/testFile.json' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/testFile.json');
  });

  it('should append .md when the file path does not end with .pdf or .json', () => {
    const req: TestReq = { path: '/testFile' };
    const basePath = 'example/';
    expect(getFilePath(req, basePath)).toBe('example/testFile.md');
  });
});
