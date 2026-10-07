import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

const importsOf = (file: string) => [...readFileSync(file, 'utf8').matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((match) => match[1] as string);

describe('framework boundary', () => {
  it('src/framework imports nothing from the app (modules, config, seed, tools, app module)', () => {
    const offenders: string[] = [];
    for (const file of sources(join(SRC, 'framework')).filter((f) => !f.endsWith('.spec.ts'))) {
      for (const spec of importsOf(file).filter((s) => s.startsWith('.'))) {
        const target = relative(SRC, resolve(dirname(file), spec));
        if (!target.startsWith('framework') && !target.startsWith('..')) offenders.push(`${relative(SRC, file)} -> ${target}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('modules never inject a connection: tenant data goes through models, c.t, c.sql or TenantDb', () => {
    const offenders = sources(join(SRC, 'modules'))
      .filter((file) => /@InjectConnection\b/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it('the old name for the partition does not survive anywhere in src', () => {
    const offenders = sources(SRC)
      .filter((file) => !file.endsWith('boundary.spec.ts') && /organi[sz]ation/i.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
