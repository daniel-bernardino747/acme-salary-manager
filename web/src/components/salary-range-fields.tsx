import { currencyOf } from '@acme/contract';
import { TextInput } from '@mantine/core';
import { useState } from 'react';
import { commitSalaryBound, salaryBoundText, type SalaryRange } from '../forms/salary-range';
import type { EmployeesSearchChange } from '../routes/search';
import classes from './filter-bar.module.css';

interface SalaryRangeFieldsProps {
  range: SalaryRange;
  onChange: (change: EmployeesSearchChange) => void;
}

/**
 * The list's annual salary range (#46), in the selected country's currency. Each field commits on
 * blur or Enter; an invalid amount stays in the field with its error, and the URL keeps its last
 * good value. Render it only with a country, keyed by it, so a new country starts empty.
 */
export function SalaryRangeFields({ range, onChange }: SalaryRangeFieldsProps) {
  return (
    <>
      <SalaryBoundField bound="min" range={range} onChange={onChange} />
      <SalaryBoundField bound="max" range={range} onChange={onChange} />
    </>
  );
}

interface SalaryBoundFieldProps extends SalaryRangeFieldsProps {
  bound: 'min' | 'max';
}

function SalaryBoundField({ bound, range, onChange }: SalaryBoundFieldProps) {
  const currency = currencyOf(range.country);
  const committed = bound === 'min' ? range.minSalaryMinor : range.maxSalaryMinor;
  // What is typed and not yet committed; null shows the bound from the URL.
  const [typed, setTyped] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // When either bound changes in the URL (a commit, Back or Forward), drop what is typed and its
  // error, so the field shows what the URL holds. Adjusted during render, without remounting, so
  // focus stays where it is.
  const rangeKey = `${range.minSalaryMinor}-${range.maxSalaryMinor}`;
  const [seenRange, setSeenRange] = useState(rangeKey);
  if (seenRange !== rangeKey) {
    setSeenRange(rangeKey);
    setTyped(null);
    setError(null);
  }

  const commit = () => {
    if (typed === null) return;
    const result = commitSalaryBound(bound, typed, range);
    if (result.success) {
      setTyped(null);
      setError(null);
      onChange(result.change);
    } else {
      setError(result.error);
    }
  };

  return (
    <TextInput
      label={bound === 'min' ? 'Minimum annual salary' : 'Maximum annual salary'}
      description={`In ${currency}`}
      classNames={{ description: classes.visuallyHidden }}
      leftSection={currency}
      leftSectionWidth={48}
      inputMode="decimal"
      value={typed ?? salaryBoundText(committed, range.country)}
      error={error}
      onChange={(event) => {
        setTyped(event.currentTarget.value);
        setError(null);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit();
      }}
      className={classes.salary}
    />
  );
}
