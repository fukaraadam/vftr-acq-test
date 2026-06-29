# Vodafone Test Suite

## Dev Setup

Run `npm install`. If browsers are not automatically installed, run `npx playwright install`

Test recording: `npx playwright codegen https://troy.vodafone.com.tr/c2d-nextjs/numara-tasima-yeni-hat`

Test run: `npx playwright test --ui`

- `--headed`: Can be used instead of `--ui`. UI mode gives better development experiance.
- `--project webkit`: only use webkit browser (or firefox, chrome)
- `npx playwright test example.spec.ts`: run specific test
- `npx playwright test -g "get started link"`: run by test name
