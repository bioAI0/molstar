import { Request, Response } from 'express';
import { getMarkdownFile } from './contentHelper';

/**
 * Processes a request and either renders a Markdown file or sends a raw file (like PDF, JSON, etc.).
 *
 * @param res - Express response object
 * @param absolutePath - Absolute file path on the server
 * @param req - Express request object
 * @param host - The host identifier
 * @param displayHost - (Optional) Additional host display argument from tests
 */
export function processRequest(
    res: Response,
    absolutePath: string,
    req: Request,
    host: string,
    displayHost?: string
): void {
    let layout = 'main';
    let view = 'showdown';

    console.log("absolutePath1=",absolutePath);

    if (absolutePath.endsWith('.pdf')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.pdbqt')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.mol2')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.js')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.css')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.json')) {
        res.sendFile(absolutePath);
        return;
    }

    if (absolutePath.endsWith('.ads.md')) {
        layout = 'ads';
        view = 'adshow';
    }

   const iframeUrl = req.path + '.ads';
    const out = getMarkdownFile(absolutePath);

    let display_host = '';
    // Mimic original logic:
    // If `host` is not 'root' or 'doi', store it in display_host.
    // If your tests call `processRequest(res, path, req, host, display_host)`,
    // you can decide whether to use that optional argument or not.
    if (host !== 'root' && host !== 'doi') {
    // If displayHost is provided, use it; otherwise fallback to host
        display_host = displayHost ?? host;
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
