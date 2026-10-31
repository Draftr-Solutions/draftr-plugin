import { execFileSync } from 'node:child_process';
import { lstat, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const candidates = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  {
    cwd: root,
    encoding: 'utf8',
  },
);
const extensions = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yaml',
  '.yml',
  '.md',
  '.mdx',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.html',
  '.htm',
  '.svg',
  '.txt',
  '.sql',
  '.toml',
  '.ini',
  '.conf',
  '.sh',
  '.bash',
  '.ps1',
  '.psm1',
  '.bat',
  '.cmd',
  '.xml',
  '.graphql',
  '.gql',
]);
const names = new Set([
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.prettierignore',
  '.npmrc',
  '.env.example',
  'Dockerfile',
  'Makefile',
  'LICENSE',
]);
const excludedDirectories =
  /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|artifacts|generated|\.git|\.next|\.cache|fonts|third-party|third_party)(?:\/|$)/u;
const lockfiles =
  /(?:^|\/)(?:pnpm-lock\.yaml|package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|bun\.lockb?)$/u;
const forbiddenDashes = /[\u2010-\u2015\u2e3a\u2e3b\ufe58\ufe63\uff0d]/gu;

let checked = 0;
let violations = 0;
for (const file of [...new Set(candidates.split('\0').filter(Boolean))].sort()) {
  const name = file.split('/').at(-1);
  if (excludedDirectories.test(file) || lockfiles.test(file)) continue;
  if (!extensions.has(extname(file).toLowerCase()) && !names.has(name)) continue;
  const path = join(root, file);
  try {
    const metadata = await lstat(path);
    if (!metadata.isFile()) continue;
    const content = await readFile(path, 'utf8');
    checked++;
    for (const [index, line] of content.split(/\r?\n/u).entries()) {
      for (const match of line.matchAll(forbiddenDashes)) {
        const codePoint = match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
        console.error(
          `${file}:${index + 1}:${match.index + 1}: Use ASCII '-' instead of U+${codePoint}.`,
        );
        violations++;
      }
    }
  } catch (error) {
    // Tracked files deleted in the working tree are not text to check.
    if (error.code !== 'ENOENT') throw error;
  }
}

if (violations) {
  console.error(`Text style check failed: ${violations} forbidden dash character(s).`);
  process.exitCode = 1;
} else {
  console.log(`Text style check passed for ${checked} maintained text files.`);
}
