/** Re-embed the shared tool language layer for standalone/offline downloads.
 * Run: node public/tools/localization/generate.mjs
 * Add new authored text to en.json; stable IDs and editable values are not translations.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const dictionary = JSON.parse(await readFile(resolve(here, 'en.json'), 'utf8'));
const runtime = await readFile(resolve(here, 'runtime.js'), 'utf8');
const payload = runtime.replace('__DICTIONARY__', () => JSON.stringify(dictionary).replaceAll('</', '<\\/'));
const toolDirectory = resolve(root, 'public/tools');
for (const name of (await readdir(toolDirectory)).filter(name => name.endsWith('.html'))) {
  const file = resolve(toolDirectory, name);
  let source = await readFile(file, 'utf8');
  source = source.replace(/\n<script data-edu-tool-language>[\s\S]*?<\/script>\n*/, '\n');
  source = source.replace('<head>', () => `<head>\n<script data-edu-tool-language>\n${payload}\n</script>\n`);
  await writeFile(file, source);
}
const manifestPath = resolve(root, 'docs/tool-source-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const entry of manifest.files) {
  if (entry.output.startsWith('public/tools/') && entry.output.endsWith('.html')) {
    entry.outputSha256 = createHash('sha256').update(await readFile(resolve(root, entry.output))).digest('hex');
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Embedded standalone localization and refreshed output hashes.');
