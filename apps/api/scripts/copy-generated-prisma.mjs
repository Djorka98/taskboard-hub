import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const sourceDir = resolve('src/generated/prisma');
const targetDir = resolve('dist/generated/prisma');

if (!existsSync(sourceDir)) {
  console.warn(`[copy-generated-prisma] Source not found: ${sourceDir}`);
  process.exit(0);
}

cpSync(sourceDir, targetDir, { recursive: true });
console.log(`[copy-generated-prisma] Copied Prisma client to ${targetDir}`);