const TARGET_ARGUMENTS = Object.freeze({
  ALL: [],
  C2D_ALL: ['tests/c2d-e2e.spec.ts'],
  MAIN_C2D: ['tests/c2d-e2e.spec.ts', '--grep', 'Main C2d Test$'],
  SIMPLE_C2D: ['tests/c2d-e2e.spec.ts', '--grep', 'Simple C2d Test$'],
  AUTOMATIC_C2D: ['tests/c2d-e2e.spec.ts', '--grep', 'Automatic C2d Test$'],
  EXAMPLE_ALL: ['tests/example.spec.ts'],
  HAS_TITLE: ['tests/example.spec.ts', '--grep', 'has title$'],
  GET_STARTED_LINK: ['tests/example.spec.ts', '--grep', 'get started link$'],
});

const BROWSERS = new Set(['chromium', 'firefox', 'webkit', 'all']);
const OVERRIDE_TARGETS = new Set(['MAIN_C2D', 'SIMPLE_C2D']);
const DB_CHECK_TARGETS = new Set(['ALL', 'C2D_ALL', 'MAIN_C2D']);

export function normalizeMnpNumber(value) {
  if (!/^(?:0?5\d{9}|\(5\d{2}\) 5\d{2} \d{2} \d{2})$/.test(value)) {
    throw new Error(
      'MNP_NUMBER 5 ile baslayan 10 haneli, basinda 0 olan 11 haneli veya "(555) 555 11 25" formatinda olmali.',
    );
  }

  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;

  return `(${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 8)} ${nationalNumber.slice(8)}`;
}

export function buildCiConfiguration(environment = process.env) {
  const target = (environment.TEST_TARGET || 'ALL').trim().toUpperCase();
  const browser = (environment.BROWSER || 'chromium').trim().toLowerCase();
  const tariffId = (environment.TARIFF_ID || '').trim();
  const mnpNumber = (environment.MNP_NUMBER || '').trim();
  const runDbCheck = (environment.RUN_DB_CHECK || 'false').trim().toLowerCase();

  if (!(target in TARGET_ARGUMENTS)) {
    throw new Error(`Gecersiz TEST_TARGET: ${target}. Izin verilenler: ${Object.keys(TARGET_ARGUMENTS).join(', ')}`);
  }

  if (!BROWSERS.has(browser)) {
    throw new Error(`Gecersiz BROWSER: ${browser}. Izin verilenler: ${[...BROWSERS].join(', ')}`);
  }

  if (!['true', 'false'].includes(runDbCheck)) {
    throw new Error('RUN_DB_CHECK true veya false olmali.');
  }

  if (runDbCheck === 'true' && !DB_CHECK_TARGETS.has(target)) {
    throw new Error('RUN_DB_CHECK yalnizca Main C2D testini iceren ALL, C2D_ALL veya MAIN_C2D hedefleriyle kullanilabilir.');
  }

  if ((tariffId || mnpNumber) && !OVERRIDE_TARGETS.has(target)) {
    throw new Error('TARIFF_ID ve MNP_NUMBER override degerleri sadece MAIN_C2D veya SIMPLE_C2D ile kullanilabilir.');
  }

  if (tariffId && !/^\d+$/.test(tariffId)) {
    throw new Error('TARIFF_ID yalnizca rakamlardan olusmali.');
  }

  const playwrightArgs = ['test', ...TARGET_ARGUMENTS[target]];
  if (browser !== 'all') playwrightArgs.push(`--project=${browser}`);

  return {
    target,
    browser,
    playwrightArgs,
    testEnvironment: {
      C2D_TARIFF_ID: tariffId,
      C2D_MNP_NUMBER: mnpNumber ? normalizeMnpNumber(mnpNumber) : '',
      C2D_RUN_DB_CHECK: runDbCheck,
    },
  };
}

export const allowedTargets = Object.freeze(Object.keys(TARGET_ARGUMENTS));
