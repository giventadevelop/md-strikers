# Matchday Red

A football-club design system derived from the visual language of manutd.com: a white editorial base, a single bold red, black for broadcast moments, and gold used sparingly. It contains no club crests, wordmarks or sponsor marks — supply your own logo.

## Content fundamentals
- **Voice:** short, factual, energetic. Interview headlines use "Name: quote" ("Captain: We need to be demanding"). Questions as hooks ("How did he find filling in at right-back?"). Video titles can exclaim ("This was some strike!").
- **CTAs:** one to three words, verb first — "Buy tickets", "Join today", "Match centre", "Shop now", "View all".
- **Meta:** relative time ("7 hours ago"), durations ("1m 19s"), report titles as "Report: Home 3 Away 0".
- Fans are addressed as family: "Something for every Red", "Experiences for the United family".

## Visual foundations
- **Colour:** `surface-100` page, `surface-200` bands. `red-500` is the one brand hue — CTAs, active tabs, hero bands. `black` frames media and match headers. `gold-400` only for Live/New/premium badges, always with black text. Use `red-text` (not `red-500`) for red type so dark mode stays legible.
- **Type:** condensed, heavy display (`display-xl`, `display-l`, `label` — uppercase) against a plain sans for reading (`heading-s`, `body`, `meta`). Fonts: Barlow Condensed and Barlow from Google Fonts, standing in for the site's proprietary face.
- **Shape:** square corners everywhere (`radius-none`); only buttons get `radius-sm`, and arrows/dots `radius-pill`. No gradients; shadow only `shadow-card` on hover.
- **Layout:** the homepage is a stack of horizontal carousels (news, video, club news, matches, store, tickets, membership), each with a `display-l` title, a "View all" link and round Previous/Next arrows. Sections sit `space-12` (mobile) / `space-16` (desktop) apart; cards `space-6` apart.
- **Imagery:** full-bleed action photography, 16:9 in cards; video cards add a black duration chip.

## Iconography
Simple line icons (account, menu, arrows, play) at 24px in `ink` or `on-red`. Social icons in the footer on `black`. No icon set is bundled — use any consistent 2px-stroke set.

## Components
Button, NewsCard, MatchCard — static class-based previews (`mr-*` classes in `components/bundle.css`).

## Notes on accuracy
Colour values follow the club's well-known red/black/gold palette rather than values read from the site's stylesheets, which weren't accessible; the typeface is a substitute. Check against official brand guidelines before production use.
