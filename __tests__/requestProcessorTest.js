const path = require('path');
<<<<<<< HEAD
const contentHelper = require('../src/doi/contentHelper');
const requestProcessor = require('../src/doi/requestProcessor');
=======
const contentHelper = require('../src/contentHelper');
const requestProcessor = require('../src/requestProcessor');
>>>>>>> 57f622e23f6f8cfc4649188e8f55dc10c0e5453b

jest.mock('../src/contentHelper');

describe('requestProcessor', () => {
    let mockRes;
    let mockReq;
    const host = 'localhost';
    const display_host = 'localhost';

    beforeEach(() => {
        mockRes = {
            render: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        mockReq = {
            path: '/test/path'
        };
    });

    it('should render with main layout and showdown view for non .ads.md paths', () => {
        const absolutePath = path.join(__dirname, 'file.md');
        contentHelper.getMarkdownFile.mockReturnValue('<p>HTML content</p>');

        requestProcessor(mockRes, absolutePath, mockReq, host, display_host);

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

    it('should render with ads layout and adshow view for .ads.md paths', () => {
        const absolutePath = path.join(__dirname, 'advertisement.ads.md');
        contentHelper.getMarkdownFile.mockReturnValue('<p>Advertisement HTML</p>');

        requestProcessor(mockRes, absolutePath, mockReq, host, display_host);

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

    it('should send a 404 response when file does not exist', () => {
        const absolutePath = path.join(__dirname, 'nonExistentFile.md');
        contentHelper.getMarkdownFile.mockReturnValue(false);

        requestProcessor(mockRes, absolutePath, mockReq, host);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith(' ');
        expect(mockRes.render).not.toHaveBeenCalled();
    });

    it('should send the raw PDF file for .pdf paths', () => {
        const absolutePath = path.join(__dirname, 'document.pdf');
        
        // Mocking sendFile method to just capture the call
        mockRes.sendFile = jest.fn();
        
        requestProcessor(mockRes, absolutePath, mockReq, host);
        
        // Check that sendFile was called with the correct absolute path
        expect(mockRes.sendFile).toHaveBeenCalledWith(absolutePath);
        expect(mockRes.render).not.toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });

    it('should send the raw JSON file for .json paths', () => {
        const absolutePath = path.join(__dirname, 'document.json');
        
        // Mocking sendFile method to just capture the call
        mockRes.sendFile = jest.fn();
        
        requestProcessor(mockRes, absolutePath, mockReq, host);
        
        // Check that sendFile was called with the correct absolute path
        expect(mockRes.sendFile).toHaveBeenCalledWith(absolutePath);
        expect(mockRes.render).not.toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.send).not.toHaveBeenCalled();
    });

});
