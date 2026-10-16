---
name: ACME Salary Manager
description: Seven countries, one official document. An HR pay tool set like the data page of a passport.
colors:
  cover-navy: "#1b2440"
  cover-raised: "#2a3557"
  cover-mist: "#d3d8e5"
  cover-haze: "#a9b2cb"
  visa-teal: "#2f6b66"
  visa-deep: "#265853"
  visa-line: "#549a93"
  visa-light: "#a8cdc9"
  visa-wash: "#eaf3f2"
  underpaid-orange: "#a64b14"
  overpaid-plum: "#6b3a7a"
  document-ink: "#1a1f2b"
  document-white: "#ffffff"
  security-tint: "#f3f5ef"
  tint-wash: "#e7ebe2"
  hairline: "#d9ded3"
  field-line: "#bcc4b6"
  hatch-grey: "#9ba394"
  muted-ink: "#596254"
  label-ink: "#454c40"
typography:
  figure:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  headline:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "2.0625rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.4375rem"
    fontWeight: 700
    lineHeight: 1.25
  panel-title:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
  body-small:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
  stamp:
    fontFamily: "'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  hairline: "1px"
  xs: "2px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.visa-teal}"
    textColor: "{colors.document-white}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.visa-deep}"
  nav-rail:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-mist}"
    width: "240px"
  nav-link:
    textColor: "{colors.cover-mist}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
    height: "40px"
  nav-link-hover:
    backgroundColor: "{colors.cover-raised}"
    textColor: "{colors.document-white}"
  nav-link-active:
    backgroundColor: "{colors.document-white}"
    textColor: "{colors.cover-navy}"
  nav-count:
    backgroundColor: "{colors.underpaid-orange}"
    textColor: "{colors.document-white}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "1px 6px"
  panel:
    backgroundColor: "{colors.document-white}"
    rounded: "{rounded.md}"
    padding: "24px"
  country-stamp:
    textColor: "{colors.visa-deep}"
    typography: "{typography.stamp}"
    rounded: "{rounded.hairline}"
    padding: "3px 5px"
  search-trigger:
    backgroundColor: "{colors.document-white}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.sm}"
    height: "40px"
    width: "560px"
  table-header:
    backgroundColor: "{colors.security-tint}"
    textColor: "{colors.label-ink}"
    typography: "{typography.label}"
  table-row-focus:
    backgroundColor: "{colors.visa-wash}"
  badge-underpaid:
    textColor: "{colors.underpaid-orange}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
  badge-overpaid:
    textColor: "{colors.overpaid-plum}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
  share-bar:
    backgroundColor: "{colors.tint-wash}"
    rounded: "{rounded.xs}"
    height: "6px"
  share-bar-fill:
    backgroundColor: "{colors.visa-teal}"
---

# Design System: ACME Salary Manager

## Overview

**Creative North Star: "The Passport Data Page"**

Seven countries, one official document. The app is set like the data page of a well-made passport: a deep cover-ink rail, a calm security-tint ground, white document panels with hairline edges, and every country and its currency stamped the same way everywhere. The person using it is an HR Manager, often answering someone who is waiting. The answer comes first: the count, the total or the median, set large in tabular figures. The method and the rate date sit directly beneath it, in muted small type, so the figure can be trusted.

The density is that of an operational tool. Panels are flat, edged by hairlines rather than shadows, and never nested. Colour is spent sparingly. Teal marks what can be acted on, orange means underpaid, plum means overpaid, and the navy cover holds the navigation. Everything else comes from one stepped neutral ramp tinted toward the security-print ground. The system is themed entirely through Mantine's `createTheme` and a small set of CSS custom properties (`--acme-*`). There is no Tailwind and no second styling layer.

The system rejects the category default it was set against: a grey sidebar, white KPI cards and one blue accent.

**Key Characteristics:**
- A navy cover rail (240px) beside a security-tint ground; white document panels on the ground.
- One family (Public Sans, self-hosted, variable weight) on a strict 1.2 scale, with tabular figures everywhere.
- The country stamp, a double-hairline frame around `IN · INR`, wherever a country or currency appears.
- A faint guilloche security-print band under every page title.
- Outlier directions in colours of their own, always paired with a word.
- Small groups hatched, never just paler.
- Focus treated as a first-class state.

## Colors

A cool navy cover, a desaturated sage-tinted paper, one teal for action, and two reserved signal colours for pay direction.

### Primary
- **Visa Teal** (visa-teal): Mantine's primary colour (`visa`, shade 6). Used for buttons, links, the selected state, the share-bar fill, the chart's full-group bars and the global focus outline. It is the only colour that means "you can act on this".
- **Visa Deep** (visa-deep): The stamp text, record names in stacked lists, the median tick on a range, and the hover state of primary buttons.
- **Visa Line** (visa-line): The stamp's double frame, the end caps of a range, and the hover border of search fields.
- **Visa Light** (visa-light): The range track, and the focus outline on the dark rail, where teal would not show.
- **Visa Wash** (visa-wash): The focused table row's background. It is also the base of the hover tint.

### Secondary
- **Cover Navy** (cover-navy): The rail's background, the active rail item's text, and the phone header's brand. It also tints every shadow (`rgba(27, 36, 64, …)`).
- **Cover Raised** (cover-raised): A rail item's hover background, the rail's dividers, and the border of the marked-value range diamond.
- **Cover Mist** (cover-mist): Rail link text.
- **Cover Haze** (cover-haze): Rail group labels, the brand line and the rate-date footer on the rail.

### Tertiary (signal)
- **Underpaid Orange** (underpaid-orange): Pay below 0.80 compa-ratio. Used for the headline count ("14 underpaid"), the "Below" badges, the selected "Underpaid" segment and the Outliers count on the rail.
- **Overpaid Plum** (overpaid-plum): Pay above 1.20. Used for the "Above" badges and the selected "Overpaid" segment.

### Neutral
All greys come from one ramp (`gray` in the theme, tuple `tint`). None come from anywhere else.
- **Security Tint** (security-tint): The page ground, table header rows and keyboard hints.
- **Tint Wash** (tint-wash): The empty part of a share bar.
- **Hairline** (hairline): Every panel, table and record border, the dividers between stacked records, and the header's bottom rule.
- **Field Line** (field-line): Borders of search triggers and keyboard hints, and the lighter stroke of the range hatch.
- **Hatch Grey** (hatch-grey): The darker stroke of the small-group hatch in legends.
- **Muted Ink** (muted-ink): Secondary text, including page questions, meta lines, footnotes and placeholders.
- **Label Ink** (label-ink): Table column headers and chart axis labels.
- **Document Ink** (document-ink): Body text and figures.
- **Document White** (document-white): Panels, tables, fields and the active rail item.

### Named Rules
**The Word-and-Colour Rule.** Underpaid and overpaid always carry a word ("Below", "Above", "underpaid", "overpaid") next to their colour. Colour alone never states a direction.

**The One Ramp Rule.** Every neutral is a step of the security-tint ramp. Step 0 is the ground, step 2 is the hairline and step 6 is muted text. Never introduce a grey from outside it.

**The Teal Means Action Rule.** Teal is reserved for what can be clicked, what is selected, and the country stamp. It is not decoration.

## Typography

**Display Font:** Public Sans (with system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Public Sans
**Label/Mono Font:** Public Sans. Keyboard hints use the app's face, not a monospace face.

**Character:** One civic, plain-spoken family at strict steps. Hierarchy comes from size and weight only, the way an official form sets its fields.

### Hierarchy
- **Figure** (700, 2.5rem, 1.1, -0.02em; 2.0625rem below 36em): The answer on a page, such as a total, a count or a median. It may take a signal colour when it states a direction.
- **Headline** (700, 2.0625rem, 1.15): The page `h1`, followed by its question as the subtitle.
- **Title** (700, 1.4375rem, 1.25): `h2` headings and the outlier headline sentence.
- **Panel Title** (700, 1.1875rem, 1.3): The title of each document panel.
- **Body** (400, 1rem, 1.5): Running text and table cells. Method notes are capped at 78ch.
- **Body Small** (400, 0.875rem, 1.45): Meta lines, record details, rail links and search triggers.
- **Label** (600–700, 0.75rem): Table headers (0.02em tracking, sentence case), footnotes, and badges.
- **Stamp** (700, 0.75rem, 0.06em, line-height 1; 0.875rem in the large size): Used only inside the country stamp.

The scale steps by 1.2 (12, 14, 16, 19, 23, 33, 40px). The 28px step is skipped.

### Named Rules
**The Tabular Rule.** Every figure is set in tabular numerals (`tnum`, set on `body`). Money columns are right-aligned and do not wrap.

**The Money Through One Door Rule.** Money is only ever shown as text through `formatMoney` or `placeDecimal`, in exact minor units. Whole units (via `wholeUnits`) are allowed only where ADR 0004 permits them: payroll totals and the cross-country comparison. Geometry, such as share bars, ranges and chart bars, is computed from `amountMinor` or `sharePermille` as plain numbers and is never shown as text.

**The Sentence Case Rule.** Headings, table headers and search group labels are in sentence case. Uppercase with tracking is used only for rail group labels ("PAY"), the brand line on the rail, the uppercase field terms on the employee view, and Mantine's badge text.

## Layout

The shell is a Mantine AppShell. On desktop, the navy rail is 240px wide on the left and the header is 64px tall. The header sits on a translucent tint (92% ground with an 8px backdrop blur) above a hairline. It holds the global search trigger (up to 560px, Ctrl K) on the left and the primary "Add employee" action on the right. Page content is capped at 1280px, centred, with padding of 24px 40px 40px. Below 48em the padding drops to 16px.

Every page starts with the same header: the `h1`, its question or date line, optional actions on the right, then the security band 16px below. Screens with two parts use a two-column grid with a 24px gap. On the Overview, the columns are 1.25fr and 1fr. On the employee view, they are 1fr and 1.3fr. The grid collapses to one column below 62em.

Spacing follows the theme scale: 8, 12, 16, 24 and 40px. Use 24px between panels and inside panels, 16px inside panels on phones (below 36em), and 12px between filter fields.

**The No Sideways Scroll Rule.** Below 48em, tables become stacked records. Each record is a white list on a hairline frame, with a hairline between items and 12px 14px padding. A key figure is never reached by scrolling sideways. The rail becomes a drawer that opens under the header. The filter bar collapses behind a "Filters" button, and its fields stack at full width.

Breakpoints are 36em (phone adjustments), 48em (drawer, stacked records and filters) and 62em (two columns become one).

## Elevation & Depth

The system is flat at rest and gets its depth from tone. The navy rail sits beside the tint ground, and white panels sit on the tint, edged by a 1px hairline. No resting panel, table or record has a shadow. Shadows are tinted with cover navy and are reserved for things that float or respond: comboboxes (md), the search overlay (xl), and the Overview's find field (xs at rest, sm on hover). The global search trigger gains xs on hover, and the marked-value dot on a range has its own small shadow.

### Shadow Vocabulary
- **xs** (`box-shadow: 0 1px 2px rgba(27, 36, 64, 0.06)`): A field you can press, at rest or on hover.
- **sm** (`box-shadow: 0 1px 3px rgba(27, 36, 64, 0.08), 0 1px 2px rgba(27, 36, 64, 0.04)`): The Overview find field on hover.
- **md** (`box-shadow: 0 6px 16px -4px rgba(27, 36, 64, 0.14), 0 2px 4px rgba(27, 36, 64, 0.06)`): Combobox dropdowns.
- **xl** (`box-shadow: 0 24px 64px -16px rgba(27, 36, 64, 0.32)`): The global search overlay.

### Named Rules
**The Hairline Not Shadow Rule.** Document surfaces are separated by a 1px hairline (hairline), never by a resting shadow. A shadow means the thing floats or responds.

## Shapes

Corners are small and official. Panels, tables, record lists, the find field and modals use 6px (md). Buttons, inputs, segmented controls, pagination, search triggers and rail items use 4px (sm). Keyboard hints use 3px. Badges, share bars, legend swatches and the Outliers count use 2px (xs). The country stamp uses 1px, which keeps it nearly square, like a printed frame. Ranges are a 4px track with 1px end caps, a 2px median tick, an 8px rotated-square average diamond and a 14px round marked value. Icons are drawn in-house on one 24px grid with a single 1.75px stroke and round caps.

**The Hatch Rule.** A group with fewer than 5 employees is hatched, never only paler. The range track uses a 135° stripe of field-line, 3px on and 3px off. The legend swatch uses a 45° stripe of hatch-grey on tint, 2px on and 2px off. The comparison chart fills small-group bars with an inline SVG hatch pattern. The legend always names the hatch ("fewer than 5 employees").

## Components

### Buttons
Plain and firm.
- **Shape:** Gently squared (4px).
- **Primary:** Visa teal filled with white text, Mantine size sm (36px). It may carry a 16px icon from the in-house set on the left (Add) or right (arrow).
- **Hover / Focus:** Hover darkens to visa deep. Focus shows the global 2px teal outline, offset 2px.
- **Subtle:** Text-only actions such as back links and "See all" use teal anchors at weight 500, underlined on hover with a 0.18em offset and a 1px line.

### Chips / Badges
- **Direction badge:** Mantine light badge with 2px corners, under or over colour, reading "Below" or "Above" (uppercase by Mantine's default). It never stands alone as colour.
- **Count badge:** On the rail, the Outliers count is white on underpaid orange, 700, with 2px corners. It stays orange even when its rail item is active.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Document white on the security-tint ground.
- **Shadow Strategy:** None at rest (see Elevation & Depth).
- **Border:** 1px hairline.
- **Internal Padding:** 24px, or 16px below 36em. Panel titles use the panel-title style with 12px below. Panels are never nested.

### Inputs / Fields
- **Style:** Mantine inputs at 4px corners, white, on the ramp's border step. The caret is teal.
- **Search triggers:** The header trigger is 40px tall and up to 560px wide, with a field-line border, a muted placeholder, a search icon and a Ctrl K hint in the app's face on the right. The Overview find field is 56px tall, uses 1.1875rem text and 6px corners, and carries xs shadow. Its hint is hidden below 36em.
- **Hover:** The border turns visa line and a light shadow appears, over 150ms.
- **Focus:** The global teal outline.

### Navigation
- **Rail:** Cover navy, 240px. At the top is the brand (white, 700, 15px) over an uppercase brand line in cover haze. Below are the links, then uppercase group labels ("PAY", 600, 0.08em tracking), and the rate date at the foot above a cover-raised rule.
- **Links:** 40px minimum height, 8px 10px padding, 4px corners, cover mist text at 500. On pointers that can hover, the background turns cover raised and the text turns white. The active link is white with navy text at 700, like a page lifted from the cover. Focus on the rail uses a visa light outline, offset 1px.
- **Phone:** The rail becomes a drawer under the header. The header shows a menu button, the brand in navy and a search icon.

### Country Stamp (signature)
A double-hairline frame around `IN · INR`, made from a 1px visa line border plus a 1px visa line outline offset 1.5px. The text is visa deep, 0.75rem, 700, tracked 0.06em, with 3px 5px padding. The large size (0.875rem, 5px 8px padding, 2px offset) is used on the employee view. The same mark appears on the Overview, the employee list, the employee view, the outlier rows and the comparison chart's axis. On a phone, the chart's axis drops it and names the country only.

### Security Band (signature)
A 12px strip of interlaced guilloche line work under every page title, drawn once as a repeating 48 × 12 SVG. It uses two teal strands at 45% opacity and two navy strands at 22% opacity, each 0.7px. It is decorative and hidden from assistive technology.

### Tables and Records
- **Tables:** Inside a white hairline frame with 6px corners. The header row is on the tint, in label style at 700 in label ink. Cells have 12px vertical padding. On hover, a row takes 70% visa wash. Under keyboard focus, the row takes visa wash with an inset 1px visa light ring. Rows that link show a pointer. Money cells are right-aligned and tabular.
- **Records (phone):** The name in visa deep at 600, then a meta line in muted small text, then the figures in a wrapping row.

### Range Bar and Share Bar
- **Range:** Shows min to max on a visa light track. The median is a visa deep tick, the average is a white diamond outlined in cover raised, and an optional marked value is a navy dot with a white ring. For a small group, the track is hatched. The figures are always in the text beside it, and the drawing has an `aria-label`.
- **Share bar:** 6px tall, with 2px corners. The track is tint wash and the fill is visa teal. The width is computed from `sharePermille` against the largest share and is never printed.

### Motion
State changes only. Use `cubic-bezier(0.22, 1, 0.36, 1)`: 150ms for links and fields, 120ms for table rows. Hover effects apply only on pointers that can hover. Under `prefers-reduced-motion: reduce`, all animation and transitions collapse to 0.01ms. Mantine's `respectReducedMotion` is on.

## Do's and Don'ts

### Do:
- **Do** theme through Mantine `createTheme` and the `--acme-*` custom properties in `global.css`. Take every colour from the five tuples (`cover`, `visa`, `under`, `over`, `gray`).
- **Do** put a country stamp wherever a country or currency appears, and the security band under every page title.
- **Do** pair underpaid and overpaid with a word every time: "Below" or "Above", "underpaid" or "overpaid".
- **Do** hatch groups of fewer than 5 employees, and name the hatch in the legend.
- **Do** show money only through `formatMoney` or `placeDecimal` in exact minor units, and use whole units only where ADR 0004 allows (payroll totals and the cross-country comparison).
- **Do** draw share bars, ranges and chart bars from `amountMinor` or `sharePermille` as plain numbers, and keep those numbers out of the text.
- **Do** keep the method, the rate date and every footnote and small-group notice directly under the figure they qualify.
- **Do** keep focus visible: the 2px teal outline offset 2px on the ground, visa light on the rail, and a lifted row in tables.
- **Do** meet WCAG AA contrast for all text, including text on tinted and signal backgrounds.

### Don't:
- **Don't** use a grey sidebar with white KPI cards and one blue accent. This is the category default the system was set against.
- **Don't** signal a pay direction by colour alone, or use orange or plum for anything except underpaid and overpaid.
- **Don't** show a small group only as a paler shade.
- **Don't** give resting panels a shadow or nest one panel inside another.
- **Don't** add a second type family, a monospace face for keyboard hints, or a size off the 1.2 scale.
- **Don't** make users scroll sideways to reach a key figure on a phone. Stack the records instead.
- **Don't** use Tailwind or any other styling layer next to the Mantine theme.
