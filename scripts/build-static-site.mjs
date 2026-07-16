import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('.');
const sourceDir = resolve(root, 'docs');
const distDir = resolve(root, 'dist');
const siteDir = resolve(distDir, 'site');
const serverDir = resolve(distDir, 'server');
const hostingDir = resolve(distDir, '.openai');

const serverSource = `
async function fetchAsset(request, env) {
  if (env?.ASSETS?.fetch) {
    return env.ASSETS.fetch(request);
  }
  return new Response('Static asset binding is unavailable.', { status: 500 });
}

export default {
  async fetch(request, env) {
    let response = await fetchAsset(request, env);

    if (response.status === 404) {
      const url = new URL(request.url);
      url.pathname = '/index.html';
      response = await fetchAsset(new Request(url.toString(), request), env);
    }

    return response;
  }
};
`.trimStart();

await rm(distDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await mkdir(serverDir, { recursive: true });
await mkdir(hostingDir, { recursive: true });

await cp(sourceDir, siteDir, { recursive: true });
await cp(resolve(root, '.openai', 'hosting.json'), resolve(hostingDir, 'hosting.json'));
await writeFile(resolve(serverDir, 'index.js'), serverSource, 'utf-8');

console.log(`Prepared deployable output in ${distDir}`);
