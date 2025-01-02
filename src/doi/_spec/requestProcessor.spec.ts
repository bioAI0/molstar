// eslint-disable-next-line @typescript-eslint/no-unused-vars
import path from 'path';
import { getMarkdownFile } from '../contentHelper';
import { processRequest } from '../requestProcessor';

jest.mock('../contentHelper');

describe('requestProcessor', () => {
    let mockRes: any;
    let mockReq: any;
    const host = 'localhost';
    const display_host = 'localhost';

    beforeEach(() => {
        mockRes = {
            render: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            sendFile: jest.fn() // Make sure we can spy on sendFile
        };

        mockReq = {
            path: '/test/path'
        };
    });

    test('should render with main layout and showdown view for non .ads.md paths', () => {
        const absolutePath = path.join(__dirname, 'file.md');
        (getMarkdownFile as jest.Mock).mockReturnValue('<p>HTML content</p>');

        processRequest(mockRes, absolutePath, mockReq, host, display_host);

        expect(mockRes.render).toHaveBeenCalledWith('showdown', {
            content: '<p>HTML content</p>',
            title: '/test/path',
            display_host: display_host,
            host: host,
            iframeUrl: '/test/path.ads',
            layout: 'main'
        });
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });

    test('should render with ads layout and adshow view for .ads.md paths', () => {
        const absolutePath = path.join(__dirname, 'advertisement.ads.md');
        (getMarkdownFile as jest.Mock).mockReturnValue('<p>Advertisement HTML</p>');

        processRequest(mockRes, absolutePath, mockReq, host, display_host);

        expect(mockRes.render).toHaveBeenCalledWith('adshow', {
            content: '<p>Advertisement HTML</p>',
            title: '/test/path',
            display_host: display_host,
            host: host,
            iframeUrl: '/test/path.ads',
            layout: 'ads'
        });
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });

    test('should send a 404 response when file does not exist', () => {
        const absolutePath = path.join(__dirname, 'nonExistentFile.md');
        (getMarkdownFile as jest.Mock).mockReturnValue(false);

        processRequest(mockRes, absolutePath, mockReq, host);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith(' ');
        expect(mockRes.render).not.toHaveBeenCalled();
    });

    test('should send the raw PDF file for .pdf paths', () => {
        const absolutePath = path.join(__dirname, 'document.pdf');

        processRequest(mockRes, absolutePath, mockReq, host);

        expect(mockRes.sendFile).toHaveBeenCalledWith(absolutePath);
        expect(mockRes.render).not.toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });

    test('should send the raw JSON file for .json paths', () => {
        const absolutePath = path.join(__dirname, 'document.json');

        processRequest(mockRes, absolutePath, mockReq, host);

        expect(mockRes.sendFile).toHaveBeenCalledWith(absolutePath);
        expect(mockRes.render).not.toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });
});
