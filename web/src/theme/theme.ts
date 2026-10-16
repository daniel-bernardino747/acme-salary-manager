import {
  Anchor,
  Badge,
  Button,
  createTheme,
  Modal,
  Pagination,
  Paper,
  SegmentedControl,
  Select,
  Table,
  TextInput,
  type MantineColorsTuple,
} from '@mantine/core';

// The passport data page (DESIGN.md): a cover-ink rail, a security-tint ground, white document
// panels, teal for actions, and the two outlier directions in colours of their own.

/** Cover ink: the rail, the header ink and dark text. */
const cover: MantineColorsTuple = [
  '#eceef4',
  '#d3d8e5',
  '#a9b2cb',
  '#7e8bb0',
  '#586795',
  '#3d4b78',
  '#2a3557',
  '#1b2440',
  '#131a30',
  '#0c1120',
];

/** Visa teal: actions, links, selection and the stamps. */
const visa: MantineColorsTuple = [
  '#eaf3f2',
  '#d3e6e4',
  '#a8cdc9',
  '#7bb3ad',
  '#549a93',
  '#3d827b',
  '#2f6b66',
  '#265853',
  '#1d4541',
  '#14322f',
];

/** Underpaid: below 0.80. Always shown with the word, never by colour alone. */
const under: MantineColorsTuple = [
  '#fbefe7',
  '#f5d9c6',
  '#ebb591',
  '#e08f5b',
  '#cc6e32',
  '#b85a1e',
  '#a64b14',
  '#8a3e10',
  '#6e310d',
  '#52240a',
];

/** Overpaid: above 1.20. */
const over: MantineColorsTuple = [
  '#f4edf6',
  '#e5d5ea',
  '#cbaed5',
  '#b086bf',
  '#9564a8',
  '#7d4b90',
  '#6b3a7a',
  '#583065',
  '#452550',
  '#321b3a',
];

/**
 * The one stepped neutral ramp, tinted toward the security-print ground: 0 is the page, 2 the
 * hairlines, 6 secondary text. No grey comes from anywhere else.
 */
const tint: MantineColorsTuple = [
  '#f3f5ef',
  '#e7ebe2',
  '#d9ded3',
  '#bcc4b6',
  '#9ba394',
  '#7a8273',
  '#596254',
  '#454c40',
  '#2f352c',
  '#1a1f18',
];

export const theme = createTheme({
  colors: { cover, visa, under, over, gray: tint },
  primaryColor: 'visa',
  primaryShade: 6,
  black: '#1a1f2b',
  white: '#ffffff',
  fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
  // One family on a strict 1.2 scale.
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.1875rem',
    xl: '1.4375rem',
  },
  lineHeights: { xs: '1.4', sm: '1.45', md: '1.5', lg: '1.4', xl: '1.3' },
  headings: {
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.0625rem', lineHeight: '1.15' },
      h2: { fontSize: '1.4375rem', lineHeight: '1.25' },
      h3: { fontSize: '1.1875rem', lineHeight: '1.3' },
      h4: { fontSize: '1rem', lineHeight: '1.4' },
    },
  },
  defaultRadius: 'sm',
  radius: { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px' },
  spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2.5rem' },
  shadows: {
    xs: '0 1px 2px rgba(27, 36, 64, 0.06)',
    sm: '0 1px 3px rgba(27, 36, 64, 0.08), 0 1px 2px rgba(27, 36, 64, 0.04)',
    md: '0 6px 16px -4px rgba(27, 36, 64, 0.14), 0 2px 4px rgba(27, 36, 64, 0.06)',
    lg: '0 16px 40px -12px rgba(27, 36, 64, 0.28)',
    xl: '0 24px 64px -16px rgba(27, 36, 64, 0.32)',
  },
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
  components: {
    Anchor: Anchor.extend({ defaultProps: { underline: 'hover', fw: 500 } }),
    Badge: Badge.extend({ defaultProps: { radius: 'xs', variant: 'light' } }),
    Button: Button.extend({ defaultProps: { radius: 'sm' } }),
    Modal: Modal.extend({
      defaultProps: { radius: 'md', overlayProps: { backgroundOpacity: 0.4 } },
    }),
    Pagination: Pagination.extend({ defaultProps: { radius: 'sm', size: 'sm' } }),
    Paper: Paper.extend({ defaultProps: { radius: 'md' } }),
    SegmentedControl: SegmentedControl.extend({ defaultProps: { radius: 'sm' } }),
    Select: Select.extend({ defaultProps: { radius: 'sm', comboboxProps: { shadow: 'md' } } }),
    Table: Table.extend({ defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md' } }),
    TextInput: TextInput.extend({ defaultProps: { radius: 'sm' } }),
  },
});
