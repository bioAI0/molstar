const fs = require('fs');
const path = require('path');
const converter = require('./converter');
const prefix = 'vaults/';

function getHost(req) {
    return req.vhost[0] === undefined ? 'root' : req.vhost[0];
}

function getBasePath(req, host) {
    if (req.hostname == "sness.doi.bio") {
        return prefix + "sness/";
    } else if (req.hostname == "mchr1.doi.bio") {
        return prefix + "mchr1/";
    } else if (host == 'root') {
        return prefix + "doi/";
    } else {
        return prefix + host + "/";
    }
}

function getFilePath(req, basePath) {
    let myp = req.path;
    let my0 = decodeURIComponent(myp).substring(1);
    let filePath = basePath + (my0 === "" ? "root" : my0);

    console.log("filePath="+filePath);

    if (filePath.endsWith('.pdf')) {
        return filePath;
    } else if (filePath.endsWith('.pdbqt')) {
        return filePath;
    } else if (filePath.endsWith('.json')) {
        return filePath;
    } else if (filePath.endsWith('.mol2')) {
        return filePath;
    } else {
        return filePath + '.md';
    }
    
}

module.exports = {
    getHost,
    getBasePath,
    getFilePath
};
