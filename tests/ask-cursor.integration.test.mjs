/**
 * Integration tests for ask-cursor.mjs.
 * Creates a stub cursor-agent executable and runs the wrapper end-to-end.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SCRIPT_PATH = path.resolve('.claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs');

function makeCursorStubDir() {
  const dir = mkdtempSync(path.join(tmpdir(), 'cursor-stub-'));
  const stubJsPath = path.join(dir, 'cursor-agent-stub.mjs');

  writeFileSync(
    stubJsPath,
    `#!/usr/bin/env node
const mode = process.env.CURSOR_STUB_MODE || 'echo';
const args = process.argv.slice(2);
if (mode === 'json') {
  process.stdout.write('{"text":"stub response"}\\n');
} else if (mode === 'error') {
  process.stderr.write('stub failure');
  process.exit(2);
} else if (mode === 'sleep') {
  setTimeout(() => {
    process.stdout.write('done');
  }, Number.parseInt(process.env.CURSOR_STUB_SLEEP_MS || '1000', 10));
} else {
  process.stdout.write(JSON.stringify({ args }));
}
`
  );

  // Create shims for both 'agent' and 'cursor-agent' so that the first
  // fallback candidate in getExecutables() is satisfied immediately.
  const shimNames =
    process.platform === 'win32' ? ['agent.cmd', 'cursor-agent.cmd'] : ['agent', 'cursor-agent'];

  for (const name of shimNames) {
    const shimPath = path.join(dir, name);
    if (process.platform === 'win32') {
      writeFileSync(shimPath, `@echo off\r\n"${process.execPath}" "${stubJsPath}" %*\r\n`);
    } else {
      writeFileSync(shimPath, `#!/usr/bin/env bash\n"${process.execPath}" "${stubJsPath}" "$@"\n`);
      chmodSync(shimPath, 0o755);
    }
  }

  return dir;
}

function runAskCursor(args, mode, extraEnv = {}) {
  const stubDir = makeCursorStubDir();
  const env = {
    ...process.env,
    CURSOR_STUB_MODE: mode,
    ...extraEnv,
    PATH: `${stubDir}${path.delimiter}${process.env.PATH || ''}`,
  };

  const result = spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd: path.resolve('.'),
    env,
    encoding: 'utf8',
    timeout: 30000,
  });

  rmSync(stubDir, { recursive: true, force: true });
  return result;
}

describe('ask-cursor integration', () => {
  it('forwards prompt and required flags to cursor-agent', () => {
    const result = runAskCursor(['hello world'], 'echo');

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.deepEqual(parsed.args, ['--print', '--output-format', 'text', 'hello world']);
  });

  it('forwards --json flag to cursor-agent output format', () => {
    const result = runAskCursor(['--json', 'prompt text'], 'echo');

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.deepEqual(parsed.args, ['--print', '--output-format', 'json', 'prompt text']);
  });

  it('passes through JSON output in --json mode', () => {
    const result = runAskCursor(['--json', 'prompt text'], 'json');

    assert.equal(result.status, 0);
    assert.match(result.stdout, /stub response/);
  });

  it('propagates cursor-agent non-zero exit and stderr', () => {
    const result = runAskCursor(['prompt text'], 'error');

    assert.equal(result.status, 2);
    assert.match(result.stderr, /stub failure/);
  });

  it('reads prompt from stdin when no arg provided', () => {
    const stubDir = makeCursorStubDir();
    const env = {
      ...process.env,
      CURSOR_STUB_MODE: 'echo',
      PATH: `${stubDir}${path.delimiter}${process.env.PATH || ''}`,
    };

    const result = spawnSync(process.execPath, [SCRIPT_PATH], {
      cwd: path.resolve('.'),
      env,
      encoding: 'utf8',
      input: 'prompt from stdin',
      timeout: 30000,
    });

    rmSync(stubDir, { recursive: true, force: true });

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.deepEqual(parsed.args, ['--print', '--output-format', 'text', 'prompt from stdin']);
  });

  it('returns 124 when cursor request times out', () => {
    const start = Date.now();
    const result = runAskCursor(['--timeout-ms', '50', 'prompt text'], 'sleep', {
      CURSOR_STUB_SLEEP_MS: '2000',
    });

    assert.equal(result.status, 124);
    assert.match(result.stderr, /timed out/i);
    assert.ok(Date.now() - start < 1500);
  });
});
