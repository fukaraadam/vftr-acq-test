import { spawnSync } from 'node:child_process';
import { buildCiConfiguration } from './ci-options.mjs';

try {
  const configuration = buildCiConfiguration();
  const result = spawnSync('npx', ['playwright', ...configuration.playwrightArgs], {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...configuration.testEnvironment,
      CI: 'true',
    },
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} catch (error) {
  console.error(`[CI validation] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}
