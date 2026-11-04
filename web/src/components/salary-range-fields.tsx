import { currencyOf } from '@acme/contract';
import { TextInput } from '@mantine/core';
import { useState } from 'react';
import {
  commitSalaryField,
  salaryFields,
  salaryFieldText,
  syncSalaryFields,
  typeSalaryBound,
  type SalaryBound,
  type SalaryRange,
} from '../forms/salary-range';
import type { EmployeesSearchChange } from '../routes/search';
import classes from './filter-bar.module.css';

interface SalaryRangeFieldsProps {
  range: SalaryRange;
  onChange: (change: EmployeesSearchChange) => void;
}

const labels: Record<SalaryBound, string> = {
  min: 'Minimum annual salary',
  max: 'Maximum annual salary',
};

/**
 * The list's annual salary range (#46), in the selected country's currency. Each field commits on
 * blur or Enter; an invalid amount stays in the field with its error, and the URL keeps its last
 * good value. Render it only with a country, keyed by it, so a new country starts empty.
 */
export function SalaryRangeFields({ range, onChange }: SalaryRangeFieldsProps) {
  const [fields, setFields] = useState(() => salaryFields(range));
  // When the URL's range changes, adjust during render, without remounting, so focus stays put.
  const synced = syncSalaryFields(fields, range);
  if (synced !== fields) {
    setFields(synced);
  }
  const currency = currencyOf(range.country);

  const commit = (bound: SalaryBound) => {
    const result = commitSalaryField(synced, bound);
    setFields(result.state);
    if (result.change) onChange(result.change);
  };

  return (['min', 'max'] as const).map((bound) => (
    <TextInput
      key={bound}
      label={labels[bound]}
      description={`In ${currency}`}
      classNames={{ description: classes.visuallyHidden }}
      leftSection={currency}
      leftSectionWidth={48}
      inputMode="decimal"
      value={salaryFieldText(synced, bound)}
      error={synced.errors[bound]}
      onChange={(event) => setFields(typeSalaryBound(synced, bound, event.currentTarget.value))}
      onBlur={() => commit(bound)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit(bound);
      }}
      className={classes.salary}
    />
  ));
}
