# Design quality

Models fall back on the same few looks. These rules push against that. They are defaults: the user's brief, their brand and the system already in the document come first. The exact command formats are in [editing-rules.md](editing-rules.md).

## Read the brief

Before the first command, state in one line what you are making: the kind of screen, who it is for, the tone and any hard constraint. Let the audience choose the look, not your habits.

- Existing design: read its tokens, styles and components with `get_document`, look at `get_design_screenshot`, and extend what is there. Do not restyle a file unless asked.
- Public services, health, finance and accessibility-first products put clarity above style.

## Depth

The look rules below apply at both depths, since good type, color and copy cost nothing extra. Depth decides how much structure you build.

- Quick: start from blocks and set only their shared tokens to your palette, with raw values where nothing repeats. Skip components, breakpoints and state variants unless asked. Check one screenshot of the finished page, and fix what fails.
- Full: follow everything here, including the system, components and variants for repeats, breakpoints, states and the whole final check.

If a Quick design grows into several screens, offer to move it to Full.

## Set the system first

At Full depth, do this in the first batch, before any screen.

- Colors: `token.set` one family of neutrals, one accent and only the status colors the screen needs. Give dark mode its own `token.mode.set`.
- Numbers: one spacing scale, such as 4, 8, 12, 16, 24, 32, 48, 64, 96, and one corner scale. Decide whether corners are sharp, soft or pill, and keep to it.
- Type: `style.set` four to six text styles and bind them with `styleBindings`.
- Blocks from `insert_block` use shared tokens such as `color/primary` and `radius/medium`. Set those tokens to your palette, or every page looks like the starter.
- Bind fills, text colors, gaps, padding and corners to tokens. A raw value in a repeated layer is a bug waiting for the next change.

## Layout

- Build with auto layout and grid frames. Use absolute positions only for real overlaps, such as a badge on a card.
- Use `layoutGrids` with 12 columns on desktop and 4 on mobile. Keep content in a container of about 1200 to 1440 wide.
- Spacing shows structure: related things sit close, and the gap between sections is much larger than any gap inside one.
- Keep body text to about 65 characters a line, roughly 560 to 680 wide at 16 to 18 px.
- Give each screen a `viewport`. On a landing page the headline, the supporting line and the main button sit above `viewport.height`.
- Do not repeat one section layout down a page. Avoid three equal cards as the default feature row, and more than two image and text splits in a row. Grid spans and full-width sections give rhythm.
- A section header stacks its heading and explainer. A small paragraph floating opposite a large heading reads as filler.
- A grid has as many cells as you have content. Never leave an empty tile.
- Line up what sits side by side: titles, prices, lists and buttons start at the same height across cards. Pin buttons to the bottom of a card with auto layout, not with padding guesses.
- Use a card only when the box means something. Spacing, a hairline or a tinted background often group things better.
- Navigation stays on one line, about 64 to 72 high.
- Give multi-column frames `breakpoints` at 1440, 768 and 390. Collapse columns, hide decoration and shrink headings there.

## Type

- Always set `fontAssetId`: `null` falls back to Noto Sans. Choose from `list_fonts` by the brief.
- Use one family, or two when the pairing has a reason. For emphasis use a heavier or italic face of the same family with `textRuns`, not a stray serif word.
- Inter is fine when the brief asks for neutral. Elsewhere try Geist, Manrope or Space Grotesk first, so screens do not all look alike.
- A serif needs a reason, such as editorial or heritage work. Fraunces and Instrument Serif are overused by models: do not reach for them by default.
- Bold is never synthesized. Pick the face, or set `fontVariations` on a variable font.
- Build hierarchy with weight and color as well as size. Use Regular, Medium and Semibold, not only Regular and Bold.
- Headings: `lineHeight` about 1.05 to 1.2 times the size, and `letterSpacing` about -1% to -2% of the size in px. Body: `lineHeight` about 1.5 to 1.6 times the size. Both values are in px.
- A hero headline fits two lines at desktop. Four lines means the size is wrong: try 48 to 72 px and fit it to the words.
- Tight italic headings clip letters such as y and g, so leave room and check the screenshot.
- Use sentence case for headings. Set capitals with `textCase`, never by typing them.
- Use a mono family for tables of numbers, so digits line up.

## Color and surfaces

- One accent, used for the same purpose across the whole page.
- Keep neutrals in one temperature. Do not mix warm and cool grays.
- Prefer off-black to `#000000` unless the brand says otherwise.
- Keep accents below full saturation, so they sit with the neutrals.
- Contrast: at least 4.5:1 for body text and 3:1 for large text. Check every button, placeholder, helper text and text over an image.
- Avoid the model favorites unless the brief asks for them: purple to blue gradients, neon glows, glass on everything, gradient headlines, and warm cream with brass for anything premium.
- Keep shadows soft and tinted toward the background, all lit from one direction. Store them in an effect style.
- One theme per page. A lone dark section in a light page looks like a paste accident. Use a darker shade of the same palette.
- For texture, use a grain fill as the rules describe, not fake noise layers.

## Content

- Write real copy for the product. No Lorem Ipsum, John Doe, Acme or Nexus.
- Plain, specific verbs. Skip "elevate", "seamless", "unleash", "next-gen" and "revolutionize".
- Numbers look real: 47.2%, not 50%. Avoid long dashes as decoration.
- A hero holds at most four text elements: an optional small label, the headline, about 20 words of support and the buttons. Trust logos and feature lists go below it.
- One label per intent: do not use "Get started", "Sign up" and "Try free" on one page.
- Button labels fit one line, one to three words.
- Small capital labels above headings mark a template. Use at most one per three sections.
- Skip numbered section labels such as "01 / Services", version tags in the hero, and colored dots that carry no state.
- Use `placeholder` for missing photos and logos, but do not let one carry the hero. For a product, compose a real piece of its interface from layers, with plausible data: it shows more than an empty picture frame.

## States

Static success screens hide most of the work. When a screen has them, design these too:

- Components: a `State` variant for default, hover, focus, disabled, loading and error, where they apply.
- Forms: the label above the field, helper or error text below it, and no placeholder used as a label.
- Empty, loading and error views, composed like any other screen. Loading follows the shape of the content.
- Navigation that shows the current page, and a way back from every screen.

## Final check

Look at `get_design_screenshot` for every frame, and again with `breakpoints` for each breakpoint. Use `read_nodes` when something looks clipped. Then go through this list and fix what fails:

- Hierarchy reads in a squint: one clear first thing on each screen.
- No text overflows, wraps badly or leaves one word alone on a line.
- Margins and gaps come from the scale, and shared elements line up.
- One accent, one corner scale, one theme, and contrast that passes.
- Sections differ in layout, and no section looks like an untouched starter block.
- The copy is real and fits the product.
- The mobile layout is designed, not just narrower.

## Styles on request

Read this part only when the chosen direction is one of these, and do not mix them in one design. For any other direction, apply the general rules above in that spirit.

### Calm minimal

For documents, workspaces and quiet product pages.

- Warm white or off-white background, near-black text and one gray for secondary text.
- Hairline dividers of about 1 px. Almost no shadows, no gradients.
- Color only in small washed-out tints for tags and status.
- Corners of 8 to 12 at most. Dark solid primary buttons with corners of 4 to 6.
- A clean sans for the interface. A serif for headings only if the brief is editorial.
- Very large spacing between sections, and a text width of about 720 to 960.

### Industrial brutalist

For data-heavy tools, technical products and portfolios. Pick one of two modes:

- Swiss print: a light paper tone, ink-black text, one hazard red, huge heavy sans headings in capitals with tight tracking and line height, and strong visible grid lines.
- Terminal: a dark background that is not pure black, off-white text, the same red, mono type for almost everything, dense tables, and at most one green status element.

In both modes:

- Corners are 0, with no soft shadows or gradients.
- Zones are split with visible 1 or 2 px strokes, and a dense data area sits against wide empty space.
- Use Archivo, Anton or Bebas Neue for display and JetBrains Mono or IBM Plex Mono for data.
- Decoration must organize real content. Grid lines drawn only to look technical do not count.
