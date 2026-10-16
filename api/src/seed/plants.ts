import type { CountryCode, JobTitle } from '@acme/contract';

// ADR 0005, *Planted outliers*. The targets are written out, not drawn.

export interface PlantedOutlier {
  jobTitle: JobTitle;
  country: CountryCode;
  direction: 'below' | 'above';
  /** The target compa-ratio, in hundredths of the base. */
  targetHundredths: number;
}

/** The only outliers in the seed: 14 underpaid and 6 overpaid, in groups of 5 or more. */
export const plantedOutliers = [
  // The smallest checked group (exactly 5) visibly flags someone: the threshold is ≥ 5, not > 5.
  { jobTitle: 'Senior Data Scientist', country: 'NL', direction: 'below', targetHundredths: 72 },
  { jobTitle: 'Software Engineer II', country: 'US', direction: 'below', targetHundredths: 68 },
  {
    jobTitle: 'Customer Support Specialist',
    country: 'IN',
    direction: 'below',
    targetHundredths: 64,
  },
  { jobTitle: 'Account Executive', country: 'GB', direction: 'below', targetHundredths: 74 },
  { jobTitle: 'Product Designer', country: 'DE', direction: 'below', targetHundredths: 70 },
  { jobTitle: 'QA Engineer', country: 'BR', direction: 'below', targetHundredths: 66 },
  { jobTitle: 'Marketing Specialist', country: 'JP', direction: 'below', targetHundredths: 75 },
  { jobTitle: 'Data Analyst', country: 'IN', direction: 'below', targetHundredths: 71 },
  { jobTitle: 'Recruiter', country: 'US', direction: 'below', targetHundredths: 69 },
  { jobTitle: 'Senior Software Engineer', country: 'GB', direction: 'below', targetHundredths: 73 },
  { jobTitle: 'Financial Analyst', country: 'DE', direction: 'below', targetHundredths: 76 },
  { jobTitle: 'Software Engineer I', country: 'BR', direction: 'below', targetHundredths: 62 },
  { jobTitle: 'Support Team Lead', country: 'JP', direction: 'below', targetHundredths: 67 },
  { jobTitle: 'Product Manager', country: 'NL', direction: 'below', targetHundredths: 70 },
  { jobTitle: 'Engineering Manager', country: 'US', direction: 'above', targetHundredths: 138 },
  { jobTitle: 'Sales Manager', country: 'GB', direction: 'above', targetHundredths: 155 },
  { jobTitle: 'Data Scientist', country: 'IN', direction: 'above', targetHundredths: 129 },
  { jobTitle: 'Senior Product Manager', country: 'DE', direction: 'above', targetHundredths: 142 },
  {
    jobTitle: 'Senior Account Executive',
    country: 'JP',
    direction: 'above',
    targetHundredths: 126,
  },
  { jobTitle: 'HR Business Partner', country: 'BR', direction: 'above', targetHundredths: 133 },
] as const satisfies readonly PlantedOutlier[];

export interface BoundaryPlant {
  jobTitle: JobTitle;
  country: CountryCode;
  /** Exactly this many hundredths of the base, exempt from step rounding. */
  ratioHundredths: 80 | 120;
}

/**
 * Two plants on the boundaries that are not outliers. Each sits in a group that is odd-sized, so
 * the median is the base itself, and the base is a whole number of 100-unit steps, so both products
 * are whole minor units and the boundary is hit exactly.
 */
export const boundaryPlants = [
  { jobTitle: 'Data Analyst', country: 'DE', ratioHundredths: 80 },
  { jobTitle: 'QA Engineer', country: 'US', ratioHundredths: 120 },
] as const satisfies readonly BoundaryPlant[];
