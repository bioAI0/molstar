// src/subdomainHelper.ts
//import * as fs from 'fs';
//import * as path from 'path';
// If you actually need this converter, uncomment the line below and ensure you have a TypeScript definition for it.
// import converter from './converter';

const prefix = 'vaults/';

/**
 * Define an interface (or type) for the shape of your incoming "req" object.
 * Modify this as needed to match your actual Express Request object shape
 * or whichever object shape you're using.
 */
interface Req {
  vhost?: (string | undefined)[];
  hostname?: string;
  path: string;
}

/**
 * Retrieves the host from the req object. Defaults to 'root' if undefined.
 */
export function getHost(req: Req): string {
  return req.vhost?.[0] === undefined ? 'root' : req.vhost[0]!;
}

/**
 * Determines the base path, depending on the req.hostname and the host.
 */
export function getBasePath(req: Req, host: string): string {
  if (req.hostname === 'sness.doi.bio') {
    return prefix + 'sness/';
  } else if (req.hostname === 'mchr1.doi.bio') {
    return prefix + 'mchr1/';
  } else if (host === 'root') {
    return prefix + 'doi/';
  } else {
    return prefix + host + '/';
  }
}

/**
 * Constructs the file path by decoding the request path and appending
 * an appropriate file extension (.md, .pdf, .json).
 */
export function getFilePath(req: Req, basePath: string): string {
  const decoded = decodeURIComponent(req.path).substring(1);
  let filePath = basePath + (decoded === '' ? 'root' : decoded);

  if (filePath.endsWith('.pdf')) {
    return filePath;
  } else if (filePath.endsWith('.json')) {
    return filePath;
  } else if (filePath.endsWith('.pdbqt')) {
      return filePath;
  } else if (filePath.endsWith('.mol2')) {
      return filePath;
  } else {
    return filePath + '.md';
  }
}
