import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

/**
 * Builds the ZIP for the OpenAI plugin portal: a portable package with the listing at its root.
 * It holds only what the listing needs, so the Claude Code manifests stay out of it.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = join(root, 'plugins/draftr');
const { version } = JSON.parse(readFileSync(join(root, 'listing/openai.plugin.json'), 'utf8'));
const dist = join(root, 'dist');
const stage = join(dist, 'draftr-openai');

rmSync(dist, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(join(root, 'listing/openai.plugin.json'), join(stage, 'plugin.json'));
for (const name of ['mcp.json', 'README.md', 'LICENSE', 'skills', 'assets'])
  cpSync(join(plugin, name), join(stage, name), { recursive: true });

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

/** A plain ZIP: Node has no writer, and tar makes one only on some systems. */
function zip(paths) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const path of paths) {
    const name = Buffer.from(relative(stage, path).split(sep).join('/'));
    const data = readFileSync(path);
    const packed = deflateRawSync(data);
    const fields = Buffer.alloc(18);
    fields.writeUInt16LE(8, 0); // Deflate.
    fields.writeUInt16LE(0, 2); // Time.
    fields.writeUInt16LE(0x5b61, 4); // 2025-11-01, a fixed date so builds match.
    fields.writeUInt32LE(crc32(data), 6);
    fields.writeUInt32LE(packed.length, 10);
    fields.writeUInt32LE(data.length, 14);
    const sizes = Buffer.alloc(4);
    sizes.writeUInt16LE(name.length, 0);
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 3, 4, 20, 0, 0, 8]),
      fields,
      sizes,
      name,
      packed,
    ]);
    const tail = Buffer.alloc(14);
    tail.writeUInt32LE(offset, 10);
    central.push(
      Buffer.concat([
        Buffer.from([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8]),
        fields,
        sizes,
        tail,
        name,
      ]),
    );
    locals.push(local);
    offset += local.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(paths.length, 8);
  end.writeUInt16LE(paths.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

const output = join(dist, `draftr-openai-${version}.zip`);
writeFileSync(output, zip(files(stage).sort()));
console.log(output);
