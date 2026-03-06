/**
 * Unit tests for ask-cursor.mjs arg parsing and command construction.
 * Run from repo root: node --test tests/ask-cursor.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  assertNonEmptyPrompt,
  parseCliArgs,
} from '../.claude/skills/omega-cursor-cli/scripts/parse-args.mjs';
import {
  buildCursorArgs,
  getExecutables,
} from '../.claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs';

describe('parseCliArgs', () => {
  it('parses prompt and options', () => {
    const opts = parseCliArgs(['review this', '--model', 'auto', '--json', '--yolo']);
    assert.strictEqual(opts.prompt, 'review this');
    assert.strictEqual(opts.model, 'auto');
    assert.strictEqual(opts.outputJson, true);
    assert.strictEqual(opts.yolo, true);
  });

  it('parses --trust flag', () => {
    const opts = parseCliArgs(['prompt', '--trust']);
    assert.strictEqual(opts.trust, true);
  });

  it('parses timeout and help flags', () => {
    const opts = parseCliArgs(['--timeout-ms', '5000', '--help']);
    assert.strictEqual(opts.timeoutMs, 5000);
    assert.strictEqual(opts.help, true);
  });

  it('supports prompt after -- sentinel', () => {
    const opts = parseCliArgs(['--model', 'o3', '--', '--not-a-flag', 'value']);
    assert.strictEqual(opts.model, 'o3');
    assert.strictEqual(opts.prompt, '--not-a-flag value');
  });

  it('throws on unknown option', () => {
    assert.throws(() => parseCliArgs(['--nope']), /Unknown option/);
  });

  it('throws on invalid timeout', () => {
    assert.throws(() => parseCliArgs(['--timeout-ms', '0']), /Invalid value for --timeout-ms/);
  });

  it('throws when --model is missing value', () => {
    assert.throws(() => parseCliArgs(['--model']), /Missing value for --model/);
  });

  it('--sandbox is a deprecated alias for --yolo', () => {
    const opts = parseCliArgs(['prompt', '--sandbox']);
    assert.strictEqual(opts.yolo, true);
  });
});

describe('assertNonEmptyPrompt', () => {
  it('throws for empty prompt', () => {
    assert.throws(() => assertNonEmptyPrompt('  '), /Prompt is required/);
  });

  it('accepts non-empty prompt', () => {
    assert.doesNotThrow(() => assertNonEmptyPrompt('ok'));
  });
});

describe('buildCursorArgs', () => {
  it('constructs minimal args when only prompt provided', () => {
    const args = buildCursorArgs({
      prompt: 'hi',
      model: '',
      outputJson: false,
      yolo: false,
      trust: false,
    });
    assert.deepStrictEqual(args, ['--print', '--output-format', 'text', 'hi']);
  });

  it('constructs required args and optional flags', () => {
    const args = buildCursorArgs({
      prompt: 'analyze file',
      model: 'claude-4.6-sonnet',
      outputJson: true,
      yolo: true,
      trust: false,
    });
    assert.deepStrictEqual(args, [
      '--print',
      '--output-format',
      'json',
      '--yolo',
      '--model',
      'claude-4.6-sonnet',
      'analyze file',
    ]);
  });

  it('includes --trust when trust is set', () => {
    const args = buildCursorArgs({
      prompt: 'hi',
      model: '',
      outputJson: false,
      yolo: false,
      trust: true,
    });
    assert.deepStrictEqual(args, ['--print', '--output-format', 'text', '--trust', 'hi']);
  });
});

describe('getExecutables', () => {
  it('returns Windows-first candidates', () => {
    const candidates = getExecutables(['--print', 'x'], true);
    assert.strictEqual(candidates[0].executable, 'cmd.exe');
    assert.deepStrictEqual(candidates[0].args.slice(0, 4), ['/d', '/s', '/c', 'agent']);
    assert.strictEqual(candidates[1].executable, 'cmd.exe');
    assert.deepStrictEqual(candidates[1].args.slice(0, 4), ['/d', '/s', '/c', 'cursor-agent']);
  });

  it('returns non-Windows candidates', () => {
    const candidates = getExecutables(['--print', 'x'], false);
    assert.strictEqual(candidates[0].executable, 'agent');
    assert.strictEqual(candidates[1].executable, 'cursor-agent');
  });
});
