import { formatMoney } from '@acme/contract';
import { expect, test } from '@playwright/test';
import { generateEmployees } from '../../api/src/seed/generate-employees';
import { plantedCostToReachThreshold } from '../../api/test/seed-story';

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

test("question 4's headline costs the planted gaps, as the seed story test expects", async ({
  page,
}) => {
  const cost = formatMoney(plantedCostToReachThreshold(), 'en', { wholeUnits: true });

  await page.goto('/pay/outliers');

  await expect(
    page.getByText(`Bringing them to 0.80 would cost ${cost} a year.`, { exact: true }),
  ).toBeVisible();
});

/** Added, edited and deleted below. No seeded name has this family name. */
const added = { name: 'Aarav Playwright', jobTitle: 'Data Analyst', department: 'Data' };

test('adding an employee in India saves the salary typed as 1,250,000.50 to the paisa', async ({
  page,
}) => {
  await page.goto('/employees');
  await page.getByRole('link', { name: 'Add employee' }).click();

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(added.name);
  await page.getByRole('combobox', { name: 'Job title' }).click();
  await page.getByRole('option', { name: added.jobTitle, exact: true }).click();
  await page.getByRole('combobox', { name: 'Department' }).click();
  await page.getByRole('option', { name: added.department, exact: true }).click();
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByRole('option', { name: 'India', exact: true }).click();
  await page.getByRole('textbox', { name: 'Annual salary' }).fill('1,250,000.50');
  await page.getByRole('button', { name: 'Add employee' }).click();

  await expect(page.getByRole('heading', { name: added.name, level: 2 })).toBeVisible();
  await expect(page.getByText('₹1,250,000.50 INR', { exact: true })).toBeVisible();
});
