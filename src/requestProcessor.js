const { getMarkdownFile } = require('./contentHelper');
const path = require('path');

function processRequest(res, absolutePath, req, host) {
    let layout = 'main';
    let view = 'showdown';

    if (absolutePath.endsWith('.pdf')) {
        return res.sendFile(absolutePath);
    }

    if (absolutePath.endsWith('.pdbqt')) {
        return res.sendFile(absolutePath);
    }

    if (absolutePath.endsWith('.mol2')) {
        return res.sendFile(absolutePath);
    }

    if (absolutePath.endsWith('.json')) {
        return res.sendFile(absolutePath);
    }

    if (absolutePath.endsWith('.ads.md')) {
        layout = 'ads';
        view = 'adshow';
    } 

    const iframeUrl = req.path + ".ads";
    let out = getMarkdownFile(absolutePath);

    let display_host = "";
    
    if (host != "root" && host != "doi") {
        display_host = host;
    }
    
    if (out !== false) {
        res.render(view, {
            content: out,
            title: req.path,
            host: host,
            display_host: display_host,
            iframeUrl: iframeUrl,
            layout: layout
        });
    } else {
        res.status(404).send(' ');
    }
}

module.exports = processRequest;
