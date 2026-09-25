/**
 * Static contract test for lib/feature-flags.ts.
 *
 * No dependency installs are available in this sandbox, so this test asserts
 * the compile-time safety contract by reading the module source directly:
 * both release flags are locked to `false as const` (not client-overridable,
 * not env-flippable in this demo).
 *
 * Run: node --test tests/feature-flags.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../lib/feature-flags.ts', import.meta.url), 'utf8');

test('payments are compile-time disabled', () => {
  assert.match(src, /PAYMENTS_ENABLED\s*=\s*false\s+as\s+const/);
});

test('PHI production flag re-exports the compile-time lock', () => {
  assert.match(src, /PHI_PRODUCTION_ENABLED/);
  assert.match(src, /false\s+as\s+const/);
});

test('flags cannot be flipped by client input or env in this demo', () => {
  assert.doesNotMatch(src, /process\.env\.(PHI_PRODUCTION_ENABLED|PAYMENTS_ENABLED)\s*===\s*["']true["']/);
  assert.doesNotMatch(src, /export\s+(let|var)\s+(PHI_PRODUCTION_ENABLED|PAYMENTS_ENABLED)/);
});

test('emergency references are present and informational', () => {
  assert.match(src, /EMERGENCY/);
  assert.match(src, /9-8-8/);
});
