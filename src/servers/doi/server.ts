import vhost from 'vhost';
import path from 'path';
import express, { Application, Request, Response, NextFunction } from 'express';
import { getHost, getBasePath, getFilePath } from './subdomainHelper';
import { processRequest } from './requestProcessor';
import { engine } from 'express-handlebars';

const app: Application = express();
const port = 4000;

// Set up Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join('/home/sness/m', 'views'));

// Serve static files (ensure correct order)
const staticPath = path.join('/home/sness/m', 'public');
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

function handleSubdomain(req: Request, res: Response, next: NextFunction): void {
   const host = getHost(req);
   const basePath = getBasePath(req, host);
   const filePath = getFilePath(req, basePath);
   const absolutePath = path.join('/home/sness', filePath);
   console.log("absolutePath=", absolutePath);

    // Pass everything to your custom request processor
   processRequest(res, absolutePath, req, host);
}

// vhost middleware (order matters!)
app.use(vhost('*.*', handleSubdomain as any));
app.use(vhost('*.doi.bio', handleSubdomain as any));
app.use(vhost('localhost', handleSubdomain as any));

// Default route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Export the app if needed for testing or external usage
export default app;
