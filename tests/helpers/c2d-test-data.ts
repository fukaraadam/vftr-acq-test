export type C2dTestName = 'main' | 'simple';

export type C2dTestData = {
  tariffId: string;
  mnpNumber: string;
};

const DEFAULTS: Record<C2dTestName, C2dTestData> = {
  main: {
    tariffId: '4358326',
    mnpNumber: '(555) 555 11 25',
  },
  simple: {
    tariffId: '4358329',
    mnpNumber: '(555) 555 54 07',
  },
};

export function readC2dTestData(testName: C2dTestName): C2dTestData {
  return {
    tariffId: process.env.C2D_TARIFF_ID || DEFAULTS[testName].tariffId,
    mnpNumber: process.env.C2D_MNP_NUMBER || DEFAULTS[testName].mnpNumber,
  };
}

export function shouldRunDbCheck() {
  return process.env.C2D_RUN_DB_CHECK === 'true';
}
