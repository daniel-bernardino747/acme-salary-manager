import { expect, test } from '@playwright/test';
import { generateEmployees } from '../../api/src/seed/generate-employees';

// ADR 0006, *One end-to-end smoke test*: the built app on the default seed, with exact values. The
// seeded figures are checked before anything changes them, so the tests run in order.
test.describe.configure({ mode: 'serial' });

/** The planted underpaid employee in the smallest checked group (ADR 0005, *Planted outliers*). */
const plantedSeniorDataScientistNl = generateEmployees().find(
  ({ plant }) =>
    plant !== null &&
    'direction' in plant &&
    plant.direction === 'below' &&
    plant.jobTitle === 'Senior Data Scientist' &&
    plant.country === 'NL',
)?.employee;

test('question 4 opens on Underpaid, listing the planted Senior Data Scientist in the Netherlands', async ({
  page,
}) => {
  expect(plantedSeniorDataScientistNl).toBeDefined();
  const name = plantedSeniorDataScientistNl?.name ?? '';

  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Who is paid out of line with their peers?' })
    .click();

  await expect(page.getByRole('radio', { name: 'Underpaid' })).toBeChecked();
  const row = page.getByRole('row').filter({ has: page.getByRole('link', { name, exact: true }) });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText('Senior Data Scientist');
  await expect(row).toContainText('Netherlands');
});
