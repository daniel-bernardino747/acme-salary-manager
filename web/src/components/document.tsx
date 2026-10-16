import type { CountryCode, OutlierDirection } from '@acme/contract';
import { Badge, Box, Group, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { countryStamp } from '../format/country-stamp';
import { rangePosition } from '../format/range-position';
import classes from './document.module.css';

interface PageHeaderProps {
  title: ReactNode;
  /** The question the page answers, as its subtitle (ADR 0004, *Routing*, as amended by #40). */
  question?: string;
  /** A line under the title, e.g. a count. */
  meta?: ReactNode;
  /** Buttons on the right of the title. */
  actions?: ReactNode;
  /** Shown above the title, e.g. a back link. */
  back?: ReactNode;
}

/** Every page's title: its `h1`, its question, and the security-print band under it. */
export function PageHeader({ title, question, meta, actions, back }: PageHeaderProps) {
  return (
    <header>
      {back}
      <div className={classes.header}>
        <div>
          <Title order={1}>{title}</Title>
          {question && <Text className={classes.question}>{question}</Text>}
          {meta && (
            <Text className={classes.question} size="sm">
              {meta}
            </Text>
          )}
        </div>
        {actions && <Group gap="sm">{actions}</Group>}
      </div>
      <div className={classes.band} aria-hidden="true" />
    </header>
  );
}

/** "IN · INR", framed: the same mark wherever a country or its currency appears. */
export function CountryStamp({ country }: { country: CountryCode }) {
  return <span className={classes.stamp}>{countryStamp(country)}</span>;
}

/** A white document panel on the tinted ground. Panels are never nested. */
export function Panel({
  title,
  titleOrder = 2,
  children,
  component = 'section',
}: {
  title?: ReactNode;
  titleOrder?: 2 | 3;
  children: ReactNode;
  component?: 'section' | 'div';
}) {
  return (
    <Box component={component} className={classes.panel}>
      {title && (
        <Title order={titleOrder} className={classes.panelTitle} mb="sm">
          {title}
        </Title>
      )}
      {children}
    </Box>
  );
}

/** A figure set large, e.g. a total or a median. */
export function Figure({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <Text component="div" className={classes.figure} c={color}>
      {children}
    </Text>
  );
}

/** Secondary text in the ramp's muted step. */
export function Muted({ children, size = 'sm' }: { children: ReactNode; size?: 'xs' | 'sm' }) {
  return (
    <Text size={size} className={classes.muted}>
      {children}
    </Text>
  );
}

/** "Below" or "Above": the outlier's direction, always in words as well as colour. */
export function DirectionBadge({ direction }: { direction: OutlierDirection }) {
  return (
    <Badge color={direction === 'below' ? 'under' : 'over'} variant="light" radius="xs">
      {direction === 'below' ? 'Below' : 'Above'}
    </Badge>
  );
}

interface RangeBarProps {
  min: number;
  max: number;
  median: number;
  average: number;
  /** A salary to mark on the range, e.g. the employee's own. */
  value?: number;
  /** A small group is hatched, not only paler. */
  smallGroup?: boolean;
  /** What the drawing shows, for screen readers; the figures are always in the text beside it. */
  label: string;
}

/**
 * Min to max drawn as a range, the median as a tick, the average as a diamond, and an optional
 * marked value. Positions are geometry from `amountMinor` as plain numbers, never shown as text
 * (ADR 0004, *Question 3*, as amended by #40).
 */
export function RangeBar({ min, max, median, average, value, smallGroup, label }: RangeBarProps) {
  const at = (amount: number) => `${rangePosition(amount, min, max)}%`;
  return (
    <div className={classes.range} role="img" aria-label={label}>
      <div className={classes.track} data-small={smallGroup || undefined} />
      <div className={classes.ends} style={{ left: 0 }} />
      <div className={classes.ends} style={{ left: 'calc(100% - 1px)' }} />
      <div className={classes.tick} style={{ left: at(median) }} />
      <div className={classes.diamond} style={{ left: at(average) }} />
      {value !== undefined && <div className={classes.dot} style={{ left: at(value) }} />}
    </div>
  );
}

/** A share-of-payroll bar, drawn from `sharePermille` as geometry against the largest share. */
export function ShareBar({ width }: { width: number }) {
  return (
    <div className={classes.share} aria-hidden="true">
      <div className={classes.shareFill} style={{ width: `${width}%` }} />
    </div>
  );
}
