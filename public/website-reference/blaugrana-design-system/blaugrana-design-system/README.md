# Blaugrana

A matchday design system , read from its live stylesheet on 6 Nov 2026. It is an **unofficial, inspired-by** system: it carries the site's colour values, type scale, spacing, radii and component patterns, but no club crest, wordmark, photography or proprietary typeface.

## Brand foundations

**Two colours, one identity.** Everything starts with *blau* (`brand-blue` #1241fd) and *grana* (`brand-grana` #bb073d), with Senyera gold (`brand-yellow` #ffc000) as the third voice. Blue does the work (primary actions, links), grana marks moments (live, matchday, highlight bars), gold sells (tickets, membership). The heritage values `classic-blue` #154284, `classic-grana` #cd122d and `classic-gold` #fdc52c remain the most used colours in older modules; use them for heritage or membership contexts, not new UI.

**Light by default, navy on matchday.** The light theme is white (`surface`) with `ink-900` text; dark sections use `navy-900` #181733 — the site's `.t-dark` — where primary flips to white.

**Stripes, not decoration.** The vertical blau-grana stripe is the one graphic motif. Use it full-bleed, at `space-xl` (24px) pitch, as a placeholder, divider or campaign band — never behind text. Gradients (`gradient-soft`, `-tight`, `-sharp`) run blue → garnet left to right only.

## Content fundamentals

- Voice: confident, warm, present tense. "Squad list confirmed", not "The squad list has been confirmed".
- Sentence case for headlines and buttons. Uppercase only in condensed kickers and tags ("LALIGA · MATCHDAY 12").
- Numbers do the talking: scorelines and kick-off times are set in `display` weights, large.
- Short CTAs: *Buy tickets*, *Become a member*, *Watch highlights*, *See all →*.

## Visual foundations

| Area | Rule |
| --- | --- |
| Type | Barlow (800 display, 700 titles, 500 labels, 400 body) and Barlow Condensed 700 for kickers — open substitutes for the site's proprietary *fcb* family (extra-bold / bold / regular / condensed-bold). Display sizes drop one step on mobile (see each style's usage). |
| Scale | Root is 10px on the site, so its `1.6rem` = 16px; all tokens here are in px. |
| Spacing | 4-based t-shirt scale `space-2xs` 4 → `space-6xl` 64. Cards pad `space-m`/`space-xl`; sections `space-3xl`–`space-6xl`. |
| Radius | `radius-full` pills for every button; `radius-m` cards; `radius-l` featured cards; `radius-s` tags and inputs; `radius-none` heroes. |
| Elevation | Soft, low shadows (`shadow-s` resting, `shadow-m` hover). Dark sections use no shadows. |
| Imagery | Full-bleed photography of play, players and fans, bottom gradient to `navy-900` for overlaid titles. Not included here — bring your own licensed images. |

## Accessibility

Text pairs are checked at 4.5:1 in both themes: `on-surface`/`surface` 18.7:1, `on-primary`/`primary` 6.6:1, `on-secondary`/`secondary` 11.4:1, white on `brand-grana` 6.5:1. Gold never carries white text. `on-surface-variant` on `surface-dim` is 4.4:1 in light (a pair the site uses — flagged; prefer `on-surface` for small text there). The dark values of `accent`, `link` and `error` are lifted assumptions; the site defines no dark variants.

## Iconography & marks

No logos or icons ship with this system. Use a simple 24px line icon set at 1.5px stroke in `on-surface`, and supply your own marks. Team crests in `MatchCard` are monogram discs unless you pass `crestSrc`.

## Components

`Button`, `Tag`, `SectionHeader`, `MatchCard`, `NewsCard` — available as `window.Blaugrana.*` (React 18). Load the Google Fonts Barlow / Barlow Condensed (bundle.css imports them).
