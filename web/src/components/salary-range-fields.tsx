import { currencyOf } from '@acme/contract';
import { Input } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { Fragment, useState } from 'react';
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
import { CountryStamp } from './document';
import classes from './salary-range-fields.module.css';

interface SalaryRangeFieldsProps {
  range: SalaryRange;
  onChange: (change: EmployeesSearchChange) => void;
}

const fields: Record<SalaryBound, { name: string; placeholder: string }> = {
  min: { name: 'Minimum annual salary', placeholder: 'No minimum' },
  max: { name: 'Maximum annual salary', placeholder: 'No maximum' },
};

/**
 * The list's annual salary range (#46): one "Annual salary" group, with the selected country's
 * stamp naming the currency, then a minimum and a maximum in one frame. A bound reads as money until
 * its field is edited. Each field commits on blur or Enter; an invalid amount stays in the field
 * with its error under the group, and the URL keeps its last good value. Render it only with a
 * country, keyed by it, so a new country starts empty.
 */
export function SalaryRangeFields({ range, onChange }: SalaryRangeFieldsProps) {
  const id = useId();
  const [state, setState] = useState(() => salaryFields(range));
  const [editing, setEditing] = useState<SalaryBound | null>(null);
  // When the URL's range changes, adjust during render, without remounting, so focus stays put.
  const synced = syncSalaryFields(state, range);
  if (synced !== state) {
    setState(synced);
  }
  const currency = currencyOf(range.country);
  // One message at a time, under the whole group; the field it belongs to is marked invalid.
  const errorBound = synced.errors.min !== null ? 'min' : synced.errors.max !== null ? 'max' : null;
  const errorId = `${id}-error`;
  const currencyId = `${id}-currency`;

  const commit = (bound: SalaryBound) => {
    const result = commitSalaryField(synced, bound);
    setState(result.state);
    if (result.change) onChange(result.change);
  };

  return (
    <Input.Wrapper
      id={id}
      label={
        <>
          Annual salary
          {/* On a phone the stamp moves up here, leaving the frame's width to the amounts. */}
          <span className={classes.labelStamp} aria-hidden>
            <CountryStamp country={range.country} />
          </span>
        </>
      }
      labelElement="div"
      error={errorBound && synced.errors[errorBound]}
      errorProps={{ id: errorId, c: 'red.8' }}
      role="group"
      aria-labelledby={`${id}-label`}
      className={classes.root}
    >
      <div className={classes.frame} data-error={errorBound !== null || undefined}>
        <span className={classes.currency}>
          <CountryStamp country={range.country} />
          <span id={currencyId} className={classes.visuallyHidden}>
            In {currency}
          </span>
        </span>
        {(['min', 'max'] as const).map((bound, index) => (
          <Fragment key={bound}>
            {index === 1 && (
              <span className={classes.to} aria-hidden>
                to
              </span>
            )}
            <Input
              variant="unstyled"
              withAria={false}
              aria-label={fields[bound].name}
              aria-describedby={errorBound === bound ? `${errorId} ${currencyId}` : currencyId}
              aria-invalid={errorBound === bound || undefined}
              placeholder={fields[bound].placeholder}
              inputMode="decimal"
              autoComplete="off"
              value={salaryFieldText(synced, bound, { editing: editing === bound })}
              onChange={(event) =>
                setState(typeSalaryBound(synced, bound, event.currentTarget.value))
              }
              onFocus={() => setEditing(bound)}
              onBlur={() => {
                setEditing(null);
                commit(bound);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit(bound);
              }}
              classNames={{ wrapper: classes.inputWrapper, input: classes.input }}
            />
          </Fragment>
        ))}
      </div>
    </Input.Wrapper>
  );
}
