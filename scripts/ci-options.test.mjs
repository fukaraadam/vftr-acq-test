import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedTargets, buildCiConfiguration, normalizeMnpNumber } from './ci-options.mjs';

test('defaults to all tests on chromium', () => {
  const configuration = buildCiConfiguration({});

  assert.equal(configuration.target, 'ALL');
  assert.deepEqual(configuration.playwrightArgs, ['test', '--project=chromium']);
  assert.equal(configuration.testEnvironment.C2D_RUN_DB_CHECK, 'false');
});

test('maps every supported target to a valid configuration', () => {
  for (const target of allowedTargets) {
    const configuration = buildCiConfiguration({ TEST_TARGET: target, BROWSER: 'all' });
    assert.equal(configuration.target, target);
    assert.equal(configuration.playwrightArgs.includes('--project=all'), false);
  }
});

test('maps a single test and browser without shell interpolation', () => {
  const configuration = buildCiConfiguration({
    TEST_TARGET: 'MAIN_C2D',
    BROWSER: 'firefox',
    TARIFF_ID: '4358326',
    MNP_NUMBER: '05555551125',
    RUN_DB_CHECK: 'true',
  });

  assert.deepEqual(configuration.playwrightArgs, [
    'test',
    'tests/c2d-e2e.spec.ts',
    '--grep',
    'Main C2d Test$',
    '--project=firefox',
  ]);
  assert.deepEqual(configuration.testEnvironment, {
    C2D_TARIFF_ID: '4358326',
    C2D_MNP_NUMBER: '(555) 555 11 25',
    C2D_RUN_DB_CHECK: 'true',
  });
});

test('normalizes accepted MNP formats', () => {
  assert.equal(normalizeMnpNumber('5555551125'), '(555) 555 11 25');
  assert.equal(normalizeMnpNumber('(555) 555 11 25'), '(555) 555 11 25');
});

test('rejects overrides for aggregate targets', () => {
  assert.throws(
    () => buildCiConfiguration({ TEST_TARGET: 'ALL', TARIFF_ID: '4358326' }),
    /sadece MAIN_C2D veya SIMPLE_C2D/,
  );
});

test('rejects DB checks for targets that do not contain Main C2D', () => {
  assert.throws(
    () => buildCiConfiguration({ TEST_TARGET: 'SIMPLE_C2D', RUN_DB_CHECK: 'true' }),
    /Main C2D testini iceren/,
  );
});

test('rejects invalid target, browser, tariff and phone values', () => {
  assert.throws(() => buildCiConfiguration({ TEST_TARGET: 'SHELL' }), /Gecersiz TEST_TARGET/);
  assert.throws(() => buildCiConfiguration({ BROWSER: 'chrome' }), /Gecersiz BROWSER/);
  assert.throws(
    () => buildCiConfiguration({ TEST_TARGET: 'MAIN_C2D', TARIFF_ID: '4358; rm' }),
    /yalnizca rakamlardan/,
  );
  assert.throws(
    () => buildCiConfiguration({ TEST_TARGET: 'SIMPLE_C2D', MNP_NUMBER: '123' }),
    /5 ile baslayan/,
  );
});
