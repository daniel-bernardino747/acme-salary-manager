import { countries, departments, jobTitles } from '@acme/contract';
import { Badge, Button, Group, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { activeFilterCount } from '../routes/search';
import { FilterIcon } from './icons';
import classes from './filter-bar.module.css';

const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));

export interface Filters {
  country?: string;
  department?: string;
  jobTitle?: string;
}

interface FilterBarProps {
  filters: Filters;
  /** A cleared select sends `null`. */
  onChange: (change: {
    country?: string | null;
    department?: string | null;
    jobTitle?: string | null;
  }) => void;
  /** Shown before the filters on every width, e.g. the list's search box. */
  leading?: ReactNode;
  /** Shown after the filters on every width, e.g. "Clear filters". */
  trailing?: ReactNode;
}

/**
 * Country, department and job title. On a desktop they sit in one row; on a phone they fold behind
 * a "Filters" button showing how many are set (ADR 0004, as amended by #40).
 */
export function FilterBar({ filters, onChange, leading, trailing }: FilterBarProps) {
  const [open, toggle] = useDisclosure(false);
  const count = activeFilterCount(filters);
  return (
    <div className={classes.bar}>
      {leading}
      <Button
        hiddenFrom="sm"
        variant="default"
        onClick={toggle.toggle}
        aria-expanded={open}
        aria-controls="filter-fields"
        leftSection={<FilterIcon size={16} />}
        rightSection={
          count > 0 ? (
            <Badge size="sm" circle color="visa" variant="filled">
              {count}
            </Badge>
          ) : null
        }
      >
        Filters
      </Button>
      <Group
        id="filter-fields"
        className={classes.fields}
        data-open={open || undefined}
        align="flex-end"
        gap="sm"
      >
        <Select
          label="Country"
          placeholder="Any country"
          data={countryOptions}
          value={filters.country ?? null}
          onChange={(country) => onChange({ country })}
          clearable
          className={classes.country}
        />
        <Select
          label="Department"
          placeholder="Any department"
          data={departments}
          value={filters.department ?? null}
          onChange={(department) => onChange({ department })}
          clearable
          className={classes.department}
        />
        <Select
          label="Job title"
          placeholder="Any job title"
          data={jobTitles}
          value={filters.jobTitle ?? null}
          onChange={(jobTitle) => onChange({ jobTitle })}
          clearable
          searchable
          className={classes.jobTitle}
        />
      </Group>
      {trailing}
    </div>
  );
}
