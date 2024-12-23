const express = require('express');
const path = require('path');
const { getHost, getBasePath, getFilePath} = require('./src/subdomainHelper');
const { getMarkdownFile } = require('./src/contentHelper');
const processRequest = require('./src/requestProcessor');
const vhost = require('vhost');
const app = express();
const port = 3000;
const handlebars  = require('express-handlebars');

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));

function handleSubdomain(req, res, next) {
    const host = getHost(req);
    const basePath = getBasePath(req, host);
    const filePath = getFilePath(req, basePath);
    const absolutePath = path.join(__dirname, filePath);

    processRequest(res, absolutePath, req, host);
}

app.use(vhost('*.*', handleSubdomain));
app.use(vhost('*.doi.bio', handleSubdomain));
app.use(vhost('localhost', handleSubdomain));

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
