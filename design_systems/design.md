# MD Strikers — UI/UX design system

This file describes the visual system that is implemented in this repository today. It is a record of the current source, not a redesign.

**Verified** means the value was read from a component, `src/app/globals.css`, or `tailwind.config.ts`. **Not explicitly defined** means the source does not set that property. Observations about which layer wins are labeled as such.

The live public site and several older themes share one stylesheet. On public club pages the `.md-organic` / `.md-public-page` rules replace the earlier crimson “Matchday” surfaces. Those earlier tokens are still in `:root` and still style any page that does not use the organic shell.

Primary sources:

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/fc-united/fcUnitedFonts.ts`
- `src/lib/fcUnitedRoutes.ts`
- `src/components/fc-united/FcUnitedHeader.tsx`
- `src/components/fc-united/FcUnitedFooter.tsx`
- `src/components/fc-united/FcUnitedMobileNav.tsx`

---

## Contents

1. [How the styles stack](#1-how-the-styles-stack)
2. [Project design overview](#2-project-design-overview)
3. [Colour system](#3-colour-system)
4. [Typography](#4-typography)
5. [Header and navigation](#5-header-and-navigation)
6. [Footer](#6-footer)
7. [Page-by-page layouts](#7-page-by-page-layouts)
8. [Buttons](#8-buttons)
9. [Cards](#9-cards)
10. [Tables, lists, and data](#10-tables-lists-and-data)
11. [Forms and inputs](#11-forms-and-inputs)
12. [Backgrounds and effects](#12-backgrounds-and-effects)
13. [Motion](#13-motion)
14. [Images, icons, and media](#14-images-icons-and-media)
15. [Tailwind and styling architecture](#15-tailwind-and-styling-architecture)
16. [Responsive behaviour](#16-responsive-behaviour)
17. [Overlays, menus, and dialogs](#17-overlays-menus-and-dialogs)
18. [Reusable components](#18-reusable-components)
19. [CSS reference](#19-css-reference)
20. [Page comparison](#20-page-comparison)
21. [Interaction and accessibility states](#21-interaction-and-accessibility-states)
22. [Design tokens](#22-design-tokens)
23. [Source index](#23-source-index)

---

## 1. How the styles stack

Three visual layers exist in the same app.

| Layer | Where it applies | What a visitor sees |
|---|---|---|
| Public club shell | Routes listed in `isFcUnitedStandaloneRoute` (`src/lib/fcUnitedRoutes.ts`) | Navy header, cloud page, royal buttons, gold accents. Class string `fcPublicShell` from `fcUnitedFonts.ts`: `md-brand md-organic md-public-page`. |
| Matchday crest tokens | `:root` in `globals.css`, `.md-btn*`, `.md-hero-*` before organic overrides | Crimson `#ef3022`, orange `#f47b20`, gold `#ffad1f`, apricot surfaces. Still the base for `.md-btn` until `.md-organic .md-btn-*` overrides them. |
| Older global chrome | Routes that are **not** standalone | `src/components/Header.tsx` and `src/components/Footer.tsx` via `ConditionalLayout`. Editorial indigo header tokens at the top of `globals.css` (`--header-bg: #fefefe`, `--header-accent-primary: #6d28d9`). Shadcn HSL tokens (`--background`, `--primary`) style `body` unless `body.md-public` paints over them. |

`body.md-public` is applied for sports routes (`MD_PUBLIC_BODY_CLASS`). Its unlayered background is `#171717` with text `#a6a6a6` (`globals.css` around the “Sports public routes” comment). The page element `.md-organic` then paints `#f4f7fb` over that, so the visible page background on club pages is cloud, not charcoal. Verified in `.md-organic { background: var(--md-cloud); }`.

Standalone routes (own header and footer, no global Header/Footer):

`/`, `/about`, `/events`, `/matches`, `/team`, `/team/*`, `/executive-team`, `/sponsors`, `/sponsors/*`, `/gallery`, `/news`, `/news/*`, `/contacts`, `/contact`, `/volunteer`, `/capital-cup-*`, `/tournaments`, `/tournaments/*`, `/leagues`, `/leagues/*`.

Tailwind is 3.4 (`package.json`: `"tailwindcss": "^3.4.1"`). Animation is CSS keyframes and transitions. `framer-motion`, GSAP, and AOS are not dependencies. Radix is present for alert dialog, label, slot, switch, and tabs. Icons on the public shell are inline SVG (Heroicons-style paths). `lucide-react` is a dependency and is used on older components such as the global `Header.tsx` avatar.

---

## 2. Project design overview

The public club is a light editorial sports site. The page field is a cool grey-blue (`#f4f7fb`). The header and footer are a deep navy (`#071b38`). Type is condensed and uppercase for headings (Barlow Condensed) and a regular grotesque for body and navigation (Barlow). Gold (`#ffc857` on the organic shell, `#ffad1f` in the crest tokens) marks the current crumb, the active nav item, and small rules. Royal blue (`#104a91`, hover `#1677d2`) is the action colour once the organic overrides apply.

Hierarchy is built by contrast of navy bands against white cards, not by a dark theme. Cards are white, radius about 16–20px, with a soft navy shadow (`rgba(7, 27, 56, …)`). Filter bars overlap the hero by a negative top margin on news, team, events, and similar catalogs (for example team `.md-tm` filter `margin-top: -44px` in the team block of `globals.css`).

Gradients are radial washes of royal or gold over navy, used on heroes, the footer, and dark bands. Glass shows up as `backdrop-filter: blur(14px)` on the sticky header and on the player dock (`.md-athlete-dock`). The public pages do not use a black or pure-white page background as the design intent of the Matchday comment in `:root`; the organic shell does use `#ffffff` for cards and `#071b38` for chrome.

Motion is short and physical: 160 / 320 / 640 ms, ease `cubic-bezier(0.2, 0.8, 0.2, 1)`, hover lift of 2px or scale 1.05, underline drawing on footer links. `prefers-reduced-motion: reduce` disables header, hero, menu, and pagination transforms (see the reduce block near line 3230 and the pagination block). On `body.md-public`, that same media query sets interactive transitions to `1ms`.

Spacing rhythm: shell `max-w-[1240px]` with `px-4 sm:px-6 lg:px-8` in header and footer. Organic sections and the footer get an extra `0.75rem` side margin, `1rem` from 768px (`.md-organic main > section` and `.md-organic footer`). Homepage hero is full-bleed and excluded from that inset.

---

## 3. Colour system

### 3.1 Live public palette (`.md-organic`)

Defined on `.md-organic` in `globals.css`.

| Colour name | Exact value | Usage | Components / pages |
|---|---|---|---|
| Navy | `#071b38` (`--md-navy`) | Header when scrolled, footer base, inner heroes, mobile menu | `FcUnitedHeader`, `FcUnitedFooter`, `.md-inner-hero--club` |
| Royal | `#104a91` (`--md-royal`) | Primary buttons, pagination numbers, footer top border, links | `.md-organic .md-btn-primary`, `.md-pagination__page` |
| Electric | `#329bff` (`--md-electric`) | Token only on `.md-organic`. Not a separate button fill in the organic button rules. | CSS variable |
| Button hover blue | `#1677d2` | Primary button hover, focus-adjacent ring `#eaf3fc` | `.md-organic .md-btn-primary:hover` |
| Gold | `#ffc857` (`--md-gold`) | Active nav, current breadcrumb, selected chips | Header `.text-brand-gold-bright` override, crumbs |
| Cloud | `#f4f7fb` (`--md-cloud`) | Page background, pagination count/status pills | `.md-organic` background |
| Ink | `#10233f` (`--md-ink`) | Body text on cloud | `.md-organic { color }` |
| Muted | `#60738c` (`--md-muted`) | Secondary copy, pagination count text | `.text-pitch-charcoal/70` remap |
| Heading on light | `#222222` | h1–h6 inside `.md-organic.md-brand`, then overridden to white on navy bands | `.md-organic.md-brand :is(h1…h6)` |
| Hero mist | `#c3d3e8` | Subtitles, breadcrumb links, footer body | `.md-inner-hero-sub`, footer `p` and `a` |
| White cards | `#ffffff` | Cards, inputs on catalogs | `.md-organic.md-public-page .bg-pitch-card` |
| Events chalk remap | `#eef3f8` | Events catalog chalk surfaces | `.md-organic .md-events-catalog .bg-pitch-chalk` |
| Header glass | `color-mix(in srgb, var(--md-navy) 62%, transparent)` | Header before scroll | `.md-organic .md-strikers-header` |
| Header border | `rgba(98, 181, 255, 0.22)` | Header bottom, mobile menu border | organic header rules |
| Dropdown panel | `#152b49` | Desktop submenu (`.bg-pitch-charcoal` remapped inside the header) | `.md-organic .md-strikers-header .bg-pitch-charcoal` |
| Dropdown text | `#c3d3e8` | Submenu links | same block |
| Footer wash | `radial-gradient(700px 240px at 50% 0%, rgba(22, 119, 210, 0.22), transparent 70%), #071b38` | Footer | `.md-organic footer` |
| Footer rule | `3px solid #104a91` | Footer top border | `.md-organic footer` |
| Story heading | `#ffffff` plus `text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55)` | `#home-story-heading` | homepage about band |
| Logo panel headings | `#0b2d59` | Headings inside `.md-hero-logo` | homepage crest panel |
| Pagination button fill | `color-mix(in srgb, var(--md-royal) 12%, #ffffff)` | Previous / Next | `.md-organic .md-pagination__prev/__next` |
| Pagination button text | `var(--md-navy)` | Previous / Next | same |
| Pagination border | `color-mix(in srgb, var(--md-royal) 48%, #ffffff)` | Button border | same |
| Pagination hover fill | `color-mix(in srgb, var(--md-royal) 20%, #ffffff)` | Hover | same |
| Pagination hover shadow | `0 4px 10px rgba(16, 74, 145, 0.18)` | Hover | same |
| Pagination disabled text | `color-mix(in srgb, var(--md-royal) 45%, #ffffff)` | Disabled | same |
| Base pagination (before organic) | fill `#e8f2fb`, text `#0c3f78`, border `#5b93d4`, hover fill `#d4e6f7`, hover border `#104a91`, status `#f3f8fd` / border `#b7d0ea`, count text `#3d5168`, numbers `#1677d2` | Shared `MdPagination` if not under `.md-organic` | `.md-pagination*` |
| News / catalog muted copy | `#4a5f7a` | Empty states, meta | `.md-nw-*`, `.md-tm-*`, `.md-ev-*` |
| News tag and ad label | `#104a91` | Ad eyebrow | `.md-nw-ad > span` |
| Most-read panel | `linear-gradient(170deg, #0b2d59 0%, #071b38 100%)`, text `#f5f8ff` | News sidebar | `.md-nw-most` |
| Ad placeholder | dashed `#8fb4e0` on `#f6f9fc` with a royal stripe | News ads | `.md-nw-ad` |

### 3.2 Player profile palette (`.md-athlete`)

Used on `/team/[id]` (`FcUnitedPlayerPage`).

| Name | Value | Usage |
|---|---|---|
| Athlete navy | `#071b35` (`--ath-navy`) | Hero, active chip text |
| Athlete deep | `#0b2547` (`--ath-deep`) | Token |
| Athlete royal | `#164c83` (`--ath-royal`) | Ink kicker |
| Athlete gold | `#f5b82e` (`--ath-gold`) | Kicker, jersey stroke, active sport chip, hover on honour links |
| Athlete white | `#f5f7fb` | Page background |
| Athlete grey band | `#e9eef5` | `.md-athlete-band--grey` |
| Jersey stroke | `-webkit-text-stroke: 1.5px #f5b82e` | `.md-athlete-hero__jersey` |
| Dock | `rgba(7, 27, 53, 0.94)` plus `backdrop-filter: blur(14px)`, gold border `rgba(245, 184, 46, 0.35)` | `.md-athlete-dock` |
| Hero gradient | `radial-gradient(540px 340px at 78% 42%, rgba(245, 184, 46, 0.22), transparent 62%), radial-gradient(680px 420px at 88% 100%, rgba(22, 76, 131, 0.45), transparent 70%), linear-gradient(105deg, #071b35 0%, #0b2d59 46%, #164c83 100%)` | `.md-athlete-hero` |

### 3.3 Matchday crest tokens (still in `:root`, overridden on organic pages)

| Name | Value | Intended usage before organic remap |
|---|---|---|
| Primary | `#ef3022` | Brand red, `--gradient-brand` start |
| Primary deep | `#b0261c` | Small text on light, gold-button border |
| Secondary | `#f47b20` | Gradient end, hover shadow |
| Accent | `#ffad1f` | Gold |
| Accent bright | `#ffd166` | Focus rings, `--gradient-gold` start `#ffe08a` → `#ffc247` → `#ffad1f` |
| Surface strong | `#c0281c` | `bg-pitch-charcoal` |
| Surface warm | `#b9441a` | `bg-pitch-forest` |
| Surface light | `#ffd8a6` | `bg-pitch-chalk` |
| Surface card | `#ffe7c6` | `bg-pitch-card` |
| On-strong muted | `#ffe1c4` | `text-pitch-stone` |
| Dark | `#171717` | `text-pitch-charcoal`, also `body.md-public` background |
| Dark secondary | `#242424` | `bg-pitch-forest` text role |
| Light | `#fff8ef` | `text-pitch-chalk` |
| Text | `#202020` | `--color-text` |
| Muted | `#a6a6a6` | `--color-muted`, `body.md-public` text |
| White token | `#ffffff` | `--color-white` |
| Button shadow | `0 10px 24px -12px rgba(239, 48, 34, 0.65)` | `.md-btn-primary` before organic override |
| Elevation | warm shadows using `rgba(80, 12, 6, …)` | `--md-shadow-rest`, `--md-shadow-float` |

Tailwind `pitch.*` and `brand.*` read these RGB channels (`tailwind.config.ts`). On `.md-public-page`, many `bg-pitch-*` and `text-pitch-*` utilities are remapped to navy, white, and royal (section 3.1). A `bg-pitch-charcoal` section that is **not** remapped still resolves to crimson `#c0281c`. The organic header specifically remaps `.bg-pitch-charcoal` inside the header to `#152b49`.

Homepage hero under `.md-organic .md-hero-stage` is navy, not the apricot stage:

`radial-gradient(ellipse 80% 28% at 50% 100%, rgba(8, 115, 75, 0.45), transparent 70%), linear-gradient(180deg, #071b35 0%, #0b2547 46%, #071b35 100%)`.

The non-organic `.md-hero-stage` (still in CSS) is `#fff6f1` with brown logo panel `#96301b → #7a170f → #7e2616` and slider `#74170f`. Organic pages replace the stage background. The logo panel class `.md-hero-logo` still has the brown gradient unless a later organic rule overrides that element. Organic sets headings inside `.md-hero-logo` to `#0b2d59`.

### 3.4 Older header palette (global `Header.tsx`, not the club shell)

From the first `:root` block in `globals.css`.

| Name | Value | Usage |
|---|---|---|
| Header background | `#fefefe` | `--header-bg` |
| Glass | `rgba(254, 254, 254, 0.92)` | `.header-glass` |
| Text | `#1e1b4b`, `#4c4377`, `#6b6394` | primary, secondary, muted |
| Accent | `#6d28d9`, `#f59e0b` | indigo and amber |
| Accent gradient | `linear-gradient(135deg, #6d28d9 0%, #a855f7 50%, #f59e0b 100%)` | CTA border animation |
| Dropdown | `#ffffff`, shadow `0 10px 40px rgba(99, 67, 138, 0.12)` | global header menus |

### 3.5 Tailwind theme colours that are not the public shell

These are configured and used by leftover pages (membership, polls, charity, Syro). They are not remapped by `.md-organic`.

- Parchment `#F5EDD8`, `#EDE0C4`, `#F0E6CC`, `#FDFAF3`
- Burgundy `#C0284A`, `#8B1030`, `#E8406A`, `#E8899A`
- Warm brown `#7A1E35`, `#9E2A48`, `#3D0D0D`
- Warm gold `#C8860A`, `#A06808`, `#E8A830`
- Syro red `#dc3545` / `#be1929` / `#990b3f`, blue `#0b2848` / `#011e94`, orange `#ff7903`, purple `#6e1b48`, maroon `#77121b`, success `#25d366`
- Shadcn HSL: `--background`, `--foreground`, `--primary`, `--destructive`, `--muted`, `--accent`, `--card`, `--border` (shadcn block in `@layer base`). Exact HSL values live next to `@layer base` in `globals.css`. Public organic pages do not use these as the page field.

### 3.6 Status colours on catalogs

| Role | Value | Where |
|---|---|---|
| Empty / warning pill (pagination rule pattern, base CSS) | Not used as an orange empty state inside `MdPagination`. Empty lists use each page’s own empty card (`#ffffff` panel, blue pill button `#1677d2`). | News, team, events, sponsors |
| Live pulse | `rgba(255, 200, 87, 0.65)` expanding to transparent | `@keyframes md-lg-live`, `@keyframes md-tn-live` |
| Error text on forms | `text-red-500` / `border-red-500` where forms follow `form_validation` patterns (profile and similar). Public contact form: see `FcUnitedContactForm`. | Forms section |
| Focus gold | `#ffd166` / `rgb(255 209 102 / 0.22)` | `body.md-public` inputs `:focus-visible` |

---

## 4. Typography

Fonts are loaded in `src/components/fc-united/fcUnitedFonts.ts` through `next/font/google`.

| Role | Family | Weights loaded | CSS variable | Where |
|---|---|---|---|---|
| Public body, nav, footer | Barlow | 300–800 | `--font-md-club` | `.md-organic` |
| Public headings | Barlow Condensed | 600, 700, 800 | `--font-md-display` | `.md-organic.md-brand :is(h1…h6)`, buttons, pagination labels |
| `fcBrand` body (also on the shell) | Inter | default | `--font-md-body` | Applied, then overridden by Barlow on `.md-organic` |
| Organic display (loaded, not the heading face) | Caprasimo 400 | `--font-organic-display` | Loaded on `fcOrganic` |
| Organic body (loaded) | Figtree 400, 600, 700 | `--font-organic-body` | Loaded on `fcOrganic` |
| Elite display (loaded) | Manrope 600, 700, 800 | `--font-elite-display` | Loaded on `fcOrganic` |
| Also loaded, not the public shell | Bebas Neue 400, Poppins 400–700, Roboto 400/500 | — | `fcBebas`, `fcPoppins`, `fcRoboto` |
| Root layout | Inter | — | `src/app/layout.tsx` on `<body>` for non-shell pages |
| Tailwind extras | DM Sans, Poppins, Playfair Display | syro sizes | `font-dm-sans`, `font-syro-primary`, `font-syro-display` |

### Public heading rules (verified)

`.md-organic.md-brand :is(h1, h2, h3, h4, h5, h6)`:

- family Barlow Condensed
- weight 800
- letter-spacing `0.02em`
- line-height `0.95`
- `text-transform: uppercase`
- colour `#222222`, then `#ffffff` on `.md-hero-stage`, `.md-band-scoreboard`, `.md-band-players`, `.md-news-band`, `.md-inner-hero--club`, `footer`, breadcrumb heroes, and `.text-white` headings

`.md-brand :is(h1, h2)` also sets uppercase and line-height `1.08` before the organic rule tightens line-height to `0.95`.

Paragraphs: `text-wrap: pretty`. Tables and `time`: `tabular-nums`.

### Scale used on public pages

| Element | Size | Notes |
|---|---|---|
| Player name | `clamp(3.4rem, 7vw, 6.4rem)`, line-height `0.84` | `.md-athlete-hero h1` |
| Jersey number | `clamp(4.5rem, 8vw, 7.5rem)`, line-height `0.8` | gold stroke, transparent fill |
| Athlete kicker | `0.75rem`, weight 700, tracking `0.22em`, uppercase, `#f5b82e` | `.md-athlete-kicker` |
| Crumb | `0.72rem`, weight 700, tracking `0.18em`, uppercase | `.md-athlete-crumb` |
| Header nav | `0.875rem`, weight 600, tracking `0.06em` (links `0.03em`), uppercase, Barlow | organic header |
| Header wordmark (sm–xl only) | `text-sm` / `0.875rem`, tracking `0.14em`; subline `10px`, tracking `0.22em` | “MD Strikers” / “Sports Club” |
| Footer column title | `text-xs` (`0.75rem`), tracking `0.24em` in the component, organic CSS sets heading weight 800 and tracking `0.08em` | `FooterHeading` plus `.md-organic footer :is(h6)` |
| Footer body | `text-sm` (`0.875rem`) | address, blurb |
| Buttons `.md-btn` | `0.875rem`, weight 700, tracking `0.04em` (organic `0.06em`), uppercase | |
| Pagination | `0.875rem` | status weight 700, count weight 500, numbers 700 |
| News meta | `15px`, line-height `1.5`, `#4a5f7a` | `.md-nw-ad > p` group |
| Ad eyebrow | `12px`, tracking `0.2em`, uppercase | `.md-nw-ad > span` |

Team hero title size is set in the `.md-tm` block (`clamp` on the page hero). News hero title is set in the `.md-nw` block. Those blocks live later in `globals.css` (news around the `.md-nw` rules, team around `.md-tm`). Exact clamp values are in those selectors; they follow the same condensed uppercase pattern.

Syro sizes in Tailwind (leftover): h1 `2.8rem`, h2 `2.2rem`, h3 `1.8rem`, h4 `1.5rem`, body `20px`, label `16px`, small `14px`.

---

## 5. Header and navigation

Component: `src/components/fc-united/FcUnitedHeader.tsx`. Mobile: `FcUnitedMobileNav.tsx`. Links: `fcUnitedNavLinks.ts`.

### Geometry

- Position: `sticky`, `top: 0`, `z-index: 50`.
- Height variable `--md-header-h`: `112px` mobile and `128px` from `md` when the logo shows; `72px` / `80px` when the logo is hidden. Logo image: `h-[96px] md:h-[112px]`, intrinsic `1003×858`, file `/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png`.
- Inner shell on organic: `max-width: none`, padding `1.25rem` / `1.5rem` (overrides the `max-w-[1240px]` shell).
- Desktop nav: `hidden` until `xl`, centered, gap `1rem` (`gap-4`), `2xl:gap-5`.

### Before and after scroll

`data-scrolled` flips after a scroll listener in the header.

| State | Background | Shadow | `::before` |
|---|---|---|---|
| Top | `color-mix(navy 62%, transparent)`, bottom border `1px solid rgba(98, 181, 255, 0.22)` | none | navy 55% mix, `blur(14px) saturate(140%)`, inset white hairline |
| Scrolled | solid `#071b38` | `0 12px 28px rgba(2, 10, 28, 0.35)` | solid navy |

The non-organic `.md-strikers-header` (still in CSS) is a brown glass bar (`rgba(116, 23, 15, 0.9)`, blur 28px, gold hairline, shadow `0 36px 56px -14px rgba(40, 8, 4, 0.72)`, enter animation `md-header-glass-in` 1.2s). Organic replaces that paint.

### Menu items

Base classes in the component (`navHoverActive`): `text-sm font-semibold`, colour utility `text-pitch-stone`, hover `text-pitch-chalk`, gold underline via `after:` scale-x. Organic then forces those links to `#ffffff`, uppercase Barlow, and a pill hover `rgba(255, 255, 255, 0.08)`.

Active item: `text-brand-gold-bright`, which organic remaps to `--md-gold` (`#ffc857`), underline fully scaled.

### Dropdowns

- Panel: `min-w-[13rem]`, `rounded-xl`, `border-t-2 border-t-brand-gold`, padding `p-2`, `shadow-pitch` (`0 24px 48px -24px rgba(0, 0, 0, 0.55)`).
- Organic fill: `#152b49`. Item text `#c3d3e8`. Active child gold.
- Open: opacity and translate, `duration-200`. Chevron rotates `180deg` over `300ms`.
- Groups built in `buildFcUnitedNavLinks`: About (About Us, Gallery, Sponsors, Contacts), Leagues (All leagues plus each published league), Team (All teams, each squad, Executive Team). Events, Matches, News, and featured tournaments are top-level when their flags allow. News is hidden until `showHeaderNews` is true.

### Mobile

`#fc-united-mobile-menu`: organic background `--md-navy`, white text, border `rgba(98, 181, 255, 0.22)`. Hamburger is in `FcUnitedMobileNav`. Enter animation `md-menu-in` exists in `globals.css` (`@keyframes md-menu-in`). Reduced motion sets `#fc-united-mobile-menu` animation to `none`.

### Auth cluster

`FcUnitedAuth.tsx` sits at the right of the header (`ml-auto`, `pl-10` on the cluster). It is the sign-in / account control, separate from the global Clerk `UserButton` pattern in `src/components/Header.tsx`.

### Global header (non-shell pages)

`src/components/Header.tsx` uses the editorial indigo tokens, a glass bar (`.header-glass`), purple accent links, and a Lucide avatar dropdown. It is not rendered on standalone club routes (`ConditionalLayout` plus `isFcUnitedStandaloneRoute`).

---

## 6. Footer

Component: `src/components/fc-united/FcUnitedFooter.tsx`.

### Structure

1. Optional sport-icon layer (`SportBackgroundIcons`). Organic CSS hides `.md-organic .md-sport-icons` (`display: none`).
2. Four-column grid from `lg`: `1.2fr 1fr 1.3fr 0.9fr`, gap `3rem` (`lg:gap-16`). Below `lg`: 1 column, `md`: 2 columns. Padding `pb-16 pt-20`, `md:pb-20 md:pt-24`.
3. Column 1: logo `h-28 md:h-32`, blurb “Maryland Strikers Sports Club — community football across Maryland and the D.C. area.”, three social circles.
4. Column 2: “Get in Touch” — Germantown Rd address and `mdstrikersinc@gmail.com`.
5. Column 3: “Quick Links” in two columns.
6. Column 4: “Ways to Help” — Corporate Sponsorship → `/sponsors`, Membership → `/membership`, Volunteer → `/volunteer`.
7. Ad slot `GoogleAdSenseRegion` region `footer_strip`, format horizontal, `minHeight={90}`.
8. Bottom bar (`border-t border-pitch-chalk/10`, shell `py-8`): “© {year} MD Strikers · Maryland Strikers Sports Club”, “Powered by Giventa Inc., USA” linking `https://www.giventa.com`, `www.giventa.com` to the same URL, and a legal nav (`aria-label="Legal"`) with `/privacy`, `/terms`, and `AdSenseConsentBanner` as a settings link. Legal text is `text-[11px] md:text-xs`. Copyright is `text-xs md:text-sm`.

### Paint (organic)

- Background: royal radial wash over `#071b38`.
- Top border: `3px solid #104a91` (the component also sets `border-t-2 border-t-brand-gold`; the organic `border-top` shorthand replaces the visible top edge).
- Headings `#ffffff`. Body and links `#c3d3e8`. Hover `#ffffff`.
- Social buttons: `h-11 w-11`, `rounded-full`, `border-pitch-chalk/15`. Hover in the component targets `pitch-lime`. Organic footer link colour rules set `a` to `#c3d3e8` and hover to white.
- Underline draw: `background-size` from `0 1px` to `100% 1px` over `--md-dur` (320ms) on `footer nav a`.

Side inset: `.md-organic footer { margin-left/right: 0.75rem }`, `1rem` from 768px.

The global `src/components/Footer.tsx` is a different footer and only wraps non-standalone routes.

---

## 7. Page-by-page layouts

Shell for every page in this section, unless noted: `FcUnitedHeader` → `main` → `FcUnitedFooter`, root class `fcPublicShell` (`min-h-screen`, column flex, antialiased). Content width inside catalogs is the page’s own wrap class (often near 1180–1240px). Page background `#f4f7fb`.

### `/` Home

File: `src/app/page.tsx` → `FcUnitedHomePage.tsx`.

1. Header.
2. Hero (`#home-hero-heading`, `.md-hero-stage`). Full-bleed navy gradient (section 3.3). Decorative `.md-hero-lights`, `.md-hero-bowl`, `.md-hero-atmosphere`, five `.md-hero-mote` spans. Keyframes `mdBowlDrift`, `mdWash`, `mdBeamL`, `mdBeamR`, `mdMote`, `mdSweep`. Two panels: crest card `.md-hero-logo` (`rounded-3xl`) and slider `.md-hero-slider` (`rounded-3xl`, overflow hidden) driven by `HeroSlider`.
3. Scoreboard / next-match band (`.bg-pitch-charcoal` section inside the homepage). On organic public pages, charcoal text utilities remap; this band is a dark fixture strip. Rows use `.md-live-row`.
4. News band (`.md-news-band`, `#home-news-heading`).
5. Standings (`.md-band-olive.md-sport-bg.bg-pitch-forest`, `#home-standings-heading`). Organic remaps `section.bg-pitch-forest` to a navy gradient with a royal radial (`rgba(22, 119, 210, 0.28)`). Table rows `.md-live-row`, `tabular-nums`.
6. Story (`#about`, `#home-story-heading`). Padding `py-24 md:py-32`. Heading forced white with a dark text-shadow. Gold rule `.md-brand-rule` (`h-0.5 w-10`).
7. A `hidden` band `bg-[#081224] py-14 md:py-20` (`aria-hidden`). It does not display.
8. Sponsor strip (`.md-sponsor-strip`, `#home-sponsors-heading`). Tiles `.md-sponsor-tile`. Hover motion is cleared under reduced motion and under the organic “is-shown” rules (transform none).
9. Closing charcoal band `border-t border-pitch-chalk/10 py-12`.
10. Footer.

### `/about`

`FcUnitedAboutPage.tsx`. Sections, in order:

1. Hero `.md-club-about-hero`: media, shade, crumb `.md-about-crumb`, kicker, gold rule, two-column grid (prose + logo). CTAs `.md-about-cta` and `.md-about-cta--ghost`.
2. Navy stat band `.md-club-about-navy.md-about-stats` — founded year, “DMV — D.C., Maryland, Virginia”.
3. “What we do” split `.md-about-split` plus card list `.md-about-cards`.
4. Grey identity band `.md-club-about-band--grey` — value cards.
5. History `#history` — lead plus timeline `.md-about-timeline` / `.md-about-milestone`.
6. News `#news` — feature article and a list.
7. Supporters `#supporters`.
8. Sponsor call `.md-club-about-navy.md-about-sponsor` with mailto and a contact CTA.
9. Footer.

Motion: `md-about-drift`, `md-about-rise` on `.md-about-reveal`.

### `/events` and `/browse-events`

`/events` → `FcUnitedEventsPage` → `FcUnitedEventsCatalogClient.tsx`. Class prefix `.md-ev`.

1. Header.
2. Hero: kicker, title “All Events”, subtitle about tickets and registration.
3. Filter card overlapping the hero: Upcoming / Past tabs, `FcCatalogTypeahead` (title, caption, id), from/to date fields.
4. Event cards (image, date, place, description, Add to Calendar, Buy tickets, Register, Donate when the event supports them).
5. `MdPagination` when the list has loaded. Page size 20.
6. Footer.

`/browse-events` (`src/app/browse-events/page.tsx`) immediately `redirect('/events')`. It has no layout of its own.

### `/events/[id]` and related flows

`src/app/events/[id]/page.tsx` is the event detail. Child routes (register, checkout, donation, competitions, manual checkout, Stripe, Givebutter, Eventcube, offering) are task flows. They are not all standalone. Where they import the club header, they match the shell; where they do not, they use the global layout. Button and form styling there often still uses Tailwind `blue-*` / `red-*` from the shared form rules rather than `.md-btn`.

### `/matches`

`FcUnitedMatchesPage` → `MatchCentreView.tsx`. Prefix `.md-mc`.

1. Hero.
2. Next-match feature (`.md-mc-next`) with crests, score, and a footer row inside the card (`.md-mc-next footer` is a card footer, not the site footer).
3. Filters: status tabs (All, Upcoming, Live, Results), competition chips, typeahead.
4. Grouped match cards (upcoming by month, then results). Grid or list layout.
5. `MdPagination`, page size 20. Changing page scrolls the list (`scroll-margin-top: 96px` on `.md-mc-list`).
6. Footer.

### `/team` and `/team?squad=`

`FcUnitedTeamPage` → `FcUnitedRosterBoard.tsx`. Prefix `.md-tm`.

1. Hero. Kicker “Squad”. Title is the selected squad name, or “Sports Team”. Subtitle “Maryland Strikers squad roster.” Navy hero, white condensed title.
2. Filter card, overlap about 44px: typeahead (name, number, position), squad `<select>`, sort (Number / Name), position tabs (Goalkeepers, Defenders, Midfielders, Forwards, plus any extra group).
3. Groups: colour dot by `data-tone`, count badge, card grid. Card links to `/team/[id]`. Photo about 96px, gold number badge.
4. `MdPagination`, page size 20.
5. Partner logo row `.md-tm-partners` (greyscale until hover).
6. Footer.

`/executive-team` uses the same board. Kicker “Committee”, title “Executive Team”, groups by department, no jersey badge, cards are `<article>` (not profile links), sort by priority then name.

### `/team/[id]`

`FcUnitedPlayerPage`. Athlete system (section 3.2).

1. Hero `.md-athlete-hero` with grid lines (`::before`, 72px grid, masked). Crumb, gold kicker, name, outlined jersey number, club line, honour chips, photo with gold radial spot and drop shadow.
2. Sticky dock `.md-athlete-dock` (`top: 4.6rem`, `z-index: 40`): sport chips and jump links. Active chip gold fill `#f5b82e` and navy text.
3. Bands `.md-athlete-band` (`padding: 3.5rem 0`), grey variant `#e9eef5`.
4. Footer.

Enter motion: `md-athlete-in`, `md-athlete-zoom`, `md-athlete-bar`, `md-athlete-medal`.

### `/news`

`FcUnitedNewsPage.tsx`. Prefix `.md-nw`.

1. Hero `.md-nw-hero`: kicker “Club news”, title “News”, subtitle.
2. Filter card `.md-nw-filtercard`: tabs All / Main News / Featured News / Press Release with counts, typeahead (title, topic, id).
3. Feed: optional lead card `.md-nw-lead`, then rows `.md-nw-row` (cover, tag, date, title, excerpt, arrow). Ad slots: top, between cards, sidebar. Between-ad index is chosen so ads are not stacked (see `cardsBeforeBetweenAd` in the component).
4. Sidebar: Most Read (navy gradient) and Advertisement.
5. `MdPagination`, page size 20.
6. Footer.

### `/news/[slug]`

`FcUnitedNewsArticlePage.tsx`. Article hero, body, and the same header/footer. Typography follows the organic heading rules. Body width is the article container in that component.

### `/gallery` and `/browse-gallery`

`/gallery` → `FcUnitedGalleryPage`. Gallery grid uses the public warm/cloud treatment and `FcCatalogTypeahead` (`GallerySearch`). Motion: `md-gallery-drift`, `md-gallery-rise`, `md-gallery-fade`, `md-gallery-shimmer`, `md-gallery-spin`. Pagination is `MdPagination` via `src/app/gallery/components/GalleryPagination.tsx`.

`/browse-gallery` (`src/app/browse-gallery/page.tsx`) is the older gallery. It is not standalone, so the global header and footer wrap it. The page itself is `min-h-screen bg-gradient-to-br from-gray-50 to-blue-50`, container `max-w-7xl`, padding `px-4 sm:px-6 lg:px-8 pt-24 pb-8`, title `text-4xl font-bold text-gray-900`, subtitle `text-lg text-gray-600`. Content is `GalleryContent` from `src/app/gallery/GalleryContent.tsx`. Fallback copy is “Loading gallery...” in `text-gray-600`.

### `/sponsors` and `/sponsors/[id]`

Catalog: `FcUnitedSponsorsCatalogClient.tsx`. Prefix `.md-sp`. Typeahead on name, type chips, stacked sponsor rows, page size 20, `MdPagination`. Skeleton shimmer `md-sp-shimmer`.

Detail: `src/app/sponsors/[id]/page.tsx` uses `FcUnitedHeader` / `FcUnitedFooter` and a white content column.

### `/leagues` and `/leagues/[slug]`

Catalog: `FcUnitedLeaguesCatalogClient.tsx`. Detail: `FcUnitedLeagueDetail.tsx` and `LeagueStandingsTable.tsx`. Live dot animation `md-lg-live` (gold ring). Standings are a real table: header, rows, numeric columns with `tabular-nums`. Page shell is the club header/footer (`src/app/leagues/page.tsx`).

### `/tournaments` and `/tournaments/[slug]`

Catalog: `FcUnitedTournamentsCatalogClient.tsx`. Prefix `.md-tn`. Upcoming/Past toggle, typeahead, cards with date and age, “View tournament”, page size 12, `MdPagination`. Live pulse `md-tn-live`. Spinner `md-tn-spin`.

Detail: `FcUnitedTournamentPage.tsx`.

### `/capital-cup-2026` and `/capital-cup-2025`

`FcUnitedCapitalCup2026Page.tsx` and `FcUnitedCapitalCup2025Page.tsx`. Standalone because the path starts with `/capital-cup-`. They use the club shell and a long-form landing (hero, fixtures, about). Year pages are also linked from the header when `showInHeader` is set on the tournament.

### `/contacts` and `/contact`

`FcUnitedContactsPage` / `FcUnitedContactForm`. Motion `md-contact-drift`, `md-contact-rise`, `md-contact-spin`. `/contact` is also standalone. Fields follow the contact form component (labels, inputs, submit). Exact input radius is in that component and the `.md-contact` CSS block.

### `/volunteer`

`FcUnitedVolunteerPage.tsx`. Standalone. Club shell plus a volunteer form/landing.

### `/membership`, `/membership/plans`, `/membership/manage`, `/membership/subscribe/[planId]`, `/membership/success`, `/membership/qr`

Not in `FC_UNITED_FULL_WIDTH`. They render inside the global Header/Footer. Visual language is the older app: Tailwind blue buttons, Radix alert dialogs for cancel, currency via `Intl.NumberFormat` with 2 fraction digits. Do not assume the navy organic shell.

### `/polls` and `/polls/[id]`

Global chrome. `PollList` uses `FcCatalogTypeahead` and `MdPagination`, so the control chrome matches the royal pagination CSS even when the page chrome is the global header.

### `/focus-groups` and `/focus-groups/[slug]`

Global chrome. `FocusGroupsGridWithSearch` uses the same typeahead and `MdPagination`.

### `/calendar`

`src/app/calendar/page.tsx`. Global chrome. Month navigation is separate from `MdPagination` (`CalendarPagination` shows a count badge, not the club footer pager).

### `/privacy`, `/terms`, `/termsofservice`

`/privacy` and `/terms` are not standalone. The global header and footer wrap a centered article: `max-w-5xl mx-auto px-8 py-8`, white card `bg-white rounded-lg shadow-md p-6`. H1 is `text-3xl font-bold text-gray-900`. H2 is `text-2xl font-semibold text-gray-900`. Body is `text-gray-700`. Meta line is `text-gray-600`. Inline links are `text-blue-600 hover:underline`. Lists are `list-disc pl-6 space-y-2`. Sections are `mb-8`. Privacy names 13881 Hopkins Rd, Germantown, MD 20874, `mdstrikersinc@gmail.com`, and 301 346 8631. Terms links to `/privacy`.

`/termsofservice` is a separate page file (`src/app/termsofservice/page.tsx`). It is not the footer’s `/terms` link. Its chrome is the global layout. Heading sizes are **not explicitly defined** in this document beyond that file.

### Auth

`/sign-in`, `/sign-up`, `/sso-callback`, `/auth/signout-redirect`, `/auth/callback`. Clerk components. Satellite vs primary behaviour is in the sign-in page, not in the organic catalog CSS.

### Route inventory

Every `page.tsx` under `src/app` is in this table. “Club shell” means the page renders `FcUnitedHeader` and `FcUnitedFooter` (or re-exports a page that does). “Global chrome” means `ConditionalLayout` still mounts `src/components/Header.tsx` and `src/components/Footer.tsx`.

| Route | File | Chrome |
|---|---|---|
| `/` | `src/app/page.tsx` | Club shell. Section list above. |
| `/about` | `src/app/about/page.tsx` | Club shell. |
| `/events` | `src/app/events/page.tsx` | Club shell. |
| `/browse-events` | `src/app/browse-events/page.tsx` | Redirect to `/events`. No paint. |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Event detail. Not in the standalone list, so global chrome wraps it unless the page file itself returns the club header. |
| `/events/[id]/register` | `src/app/events/[id]/register/page.tsx` | Registration form. Global chrome. |
| `/events/[id]/register/success` | `.../register/success/page.tsx` | Success state. Global chrome. |
| `/events/[id]/checkout` | `.../checkout/page.tsx` | Checkout. Global chrome. |
| `/events/[id]/manual-checkout` | `.../manual-checkout/page.tsx` | Manual checkout. Global chrome. |
| `/events/[id]/manual-checkout/success` | `.../manual-checkout/success/page.tsx` | Success. Global chrome. |
| `/events/[id]/tickets` | `.../tickets/page.tsx` | Ticket flow. Global chrome. |
| `/events/[id]/tickets-stripe-web-client` | `.../tickets-stripe-web-client/page.tsx` | Stripe web client. Global chrome. |
| `/events/[id]/givebutter-checkout` | `.../givebutter-checkout/page.tsx` | Givebutter. Global chrome. |
| `/events/[id]/eventcube-checkout` | `.../eventcube-checkout/page.tsx` | Eventcube. Global chrome. |
| `/events/[id]/donation` | `.../donation/page.tsx` | Donation form. Global chrome. |
| `/events/[id]/donation-checkout` | `.../donation-checkout/page.tsx` | Donation checkout. Global chrome. |
| `/events/[id]/donation/success` | `.../donation/success/page.tsx` | Success. Global chrome. |
| `/events/[id]/offering` | `.../offering/page.tsx` | Offering. Global chrome. |
| `/events/[id]/offering/success` | `.../offering/success/page.tsx` | Success. Global chrome. |
| `/events/[id]/competitions` | `.../competitions/page.tsx` | Competition index. Global chrome. |
| `/events/[id]/competitions/catalog` | `.../competitions/catalog/page.tsx` | Catalog. Global chrome. |
| `/events/[id]/competitions/register` | `.../competitions/register/page.tsx` | Register. Global chrome. |
| `/events/[id]/competitions/rules` | `.../competitions/rules/page.tsx` | Rules. Global chrome. |
| `/events/[id]/competitions/winners` | `.../competitions/winners/page.tsx` | Winners. Global chrome. |
| `/events/[id]/competitions/my-registrations` | `.../competitions/my-registrations/page.tsx` | Registrations. Global chrome. |
| `/events/[id]/competitions/[compId]` | `.../competitions/[compId]/page.tsx` | One competition. Global chrome. |
| `/matches` | `src/app/matches/page.tsx` | Club shell. |
| `/team`, `/team?squad=` | `src/app/team/page.tsx` | Club shell. |
| `/team/[id]` | `src/app/team/[id]/page.tsx` | Club shell, athlete system. |
| `/executive-team` | `src/app/executive-team/page.tsx` | Club shell, roster board. |
| `/news` | `src/app/news/page.tsx` | Club shell. |
| `/news/[slug]` | `src/app/news/[slug]/page.tsx` | Club shell. |
| `/gallery` | `src/app/gallery/page.tsx` | Club shell. |
| `/browse-gallery` | `src/app/browse-gallery/page.tsx` | Global chrome plus the grey-to-blue page described above. |
| `/sponsors` | `src/app/sponsors/page.tsx` | Club shell. |
| `/sponsors/[id]` | `src/app/sponsors/[id]/page.tsx` | Club header and footer in the page file. |
| `/leagues` | `src/app/leagues/page.tsx` | Club shell. |
| `/leagues/[slug]` | `src/app/leagues/[slug]/page.tsx` | Club shell. |
| `/tournaments` | `src/app/tournaments/page.tsx` | Club shell. |
| `/tournaments/[slug]` | `src/app/tournaments/[slug]/page.tsx` | Club shell. |
| `/capital-cup-2025` | `src/app/capital-cup-2025/page.tsx` | Club shell. |
| `/capital-cup-2026` | `src/app/capital-cup-2026/page.tsx` | Club shell. |
| `/contacts` | `src/app/contacts/page.tsx` | Club shell. |
| `/contact` | `src/app/contact/page.tsx` | Re-exports `/contacts`. Same paint. |
| `/volunteer` | `src/app/volunteer/page.tsx` | Club shell (`FcUnitedVolunteerPage`). |
| `/membership` | `src/app/membership/page.tsx` | Global chrome. Blue Tailwind actions, currency with 2 fraction digits. |
| `/membership/plans` | `src/app/membership/plans/page.tsx` | Global chrome. |
| `/membership/manage` | `src/app/membership/manage/page.tsx` | Global chrome. |
| `/membership/subscribe/[planId]` | `src/app/membership/subscribe/[planId]/page.tsx` | Global chrome. |
| `/membership/success` | `src/app/membership/success/page.tsx` | Global chrome. |
| `/membership/qr` | `src/app/membership/qr/page.tsx` | Global chrome. |
| `/polls` | `src/app/polls/page.tsx` | Global chrome. `PollList` uses typeahead and `MdPagination`. |
| `/polls/[id]` | `src/app/polls/[id]/page.tsx` | Global chrome. |
| `/polls/vote-success` | `src/app/polls/vote-success/page.tsx` | Global chrome. |
| `/focus-groups` | `src/app/focus-groups/page.tsx` | Global chrome. Grid uses typeahead and `MdPagination`. |
| `/focus-groups/[slug]` | `src/app/focus-groups/[slug]/page.tsx` | Global chrome. |
| `/calendar` | `src/app/calendar/page.tsx` | Global chrome. Month pager is not `MdPagination`. |
| `/privacy` | `src/app/privacy/page.tsx` | Global chrome. White legal card. |
| `/terms` | `src/app/terms/page.tsx` | Global chrome. White legal card. |
| `/termsofservice` | `src/app/termsofservice/page.tsx` | Global chrome. Separate from `/terms`. |
| `/sign-in` | `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk. |
| `/sign-up` | `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk. |
| `/sign-in-backend` | `src/app/(auth)/sign-in-backend/page.tsx` | Auth utility. Global chrome. |
| `/sign-up-backend` | `src/app/(auth)/sign-up-backend/page.tsx` | Auth utility. Global chrome. |
| `/sso-callback` | `src/app/sso-callback/page.tsx` | Clerk callback. |
| `/auth/callback` | `src/app/auth/callback/page.tsx` | Auth callback. |
| `/auth/signout-redirect` | `src/app/auth/signout-redirect/page.tsx` | Sign-out redirect. |
| `/profile` | `src/app/profile/page.tsx` | Global chrome. Profile form, red validation borders when invalid. |
| `/dashboard` | `src/app/dashboard/page.tsx` | Global chrome. |
| `/settings` | `src/app/settings/page.tsx` | Global chrome. |
| `/pricing` | `src/app/pricing/page.tsx` | Global chrome. |
| `/tasks`, `/tasks/new`, `/tasks/[id]/edit` | `src/app/tasks/...` | Global chrome. Uses `src/components/Pagination.tsx`, not `MdPagination`. |
| `/donate` | `src/app/donate/page.tsx` | Global chrome. |
| `/philanthrop` | `src/app/philanthrop/page.tsx` | Global chrome. Search input `name="s"` does not filter a listing. |
| `/charity-theme` | `src/app/charity-theme/page.tsx` | Global chrome. Parchment and burgundy tokens. |
| `/member-portal` | `src/app/member-portal/page.tsx` | Global chrome. |
| `/home-backup` | `src/app/home-backup/page.tsx` | Backup homepage. Global chrome. |
| `/event` | `src/app/event/page.tsx` | Legacy event index. Global chrome. |
| `/event/[slug]` | `src/app/event/[slug]/page.tsx` | Legacy detail. Global chrome. |
| `/event/success` | `src/app/event/success/page.tsx` | Success. Global chrome. |
| `/event/ticket-qr` | `src/app/event/ticket-qr/page.tsx` | QR. Global chrome. |
| `/event/registration` | `src/app/event/registration/page.tsx` | Registration. Global chrome. |
| `/unsubscribe-email` | `src/app/unsubscribe-email/page.tsx` | Utility page. Global chrome. |
| `/resubscribe-email` | `src/app/resubscribe-email/page.tsx` | Utility page. Global chrome. |
| `/creator-analytics` | `src/app/creator-analytics/page.tsx` | Utility page. Global chrome. |
| `/scrollbar-demo` | `src/app/scrollbar-demo/page.tsx` | Demo. Global chrome. |
| `/examples/auth-usage` | `src/app/examples/auth-usage/page.tsx` | Example. Global chrome. |
| `/test-mobile` | `src/app/test-mobile/page.tsx` | Test page. Global chrome. |
| `/ipartner-test` | `src/app/ipartner-test/page.tsx` | Test page. Global chrome. |

Checkout, competition, and legacy event pages share the global header, a white or grey content column, and Tailwind `gray-*` / `blue-*` controls. Their inner section order is the form or receipt in each file. They do not use `.md-nw`, `.md-tm`, `.md-ev`, or the navy organic hero.

`/charity-theme` uses the parchment and burgundy tokens. Syro colours and spacing in `tailwind.config.ts` are leftover church styles, not the club catalogs.

`src/components/EventsCatalogClient.tsx` still contains a blue pagination footer. No current public page imports it. The live events page uses `FcUnitedEventsCatalogClient` and `MdPagination`.

---

## 8. Buttons

### `.md-btn` family (`globals.css`, `@layer components`)

Shared geometry: inline-flex, gap `0.5rem`, padding `0.75rem 1.5rem`, radius `--radius-button` (`0.5rem`), size `0.875rem`, weight 700, tracking `0.04em`, uppercase. Hover `translateY(-2px)`. Active `translateY(0) scale(0.98)` in `--md-dur-fast` (160ms). Focus `2px solid #ffd166`, offset `2px`. Disabled opacity `0.5`, no transform.

| Class | Before organic | On `.md-organic` |
|---|---|---|
| `.md-btn` | radius `0.5rem` | radius `999px`, Barlow Condensed, tracking `0.06em` |
| `.md-btn-primary` | gradient `#ef3022` → `#f47b20`, white text, red shadow, light sweep `::after` 0.7s | flat `#104a91`, white text, no filter. Hover `#1677d2`, `translateY(-2px)`, ring `0 0 0 4px #eaf3fc`, shadow `0 10px 24px rgba(16, 74, 145, 0.28)` |
| `.md-btn-secondary`, `.md-btn-secondary-light`, `.md-btn-gold` | gold gradient `#ffe08a` → `#ffad1f`, text `#8a1c12`, sweep | secondary/secondary-light: transparent, ink text, `1px` border at 16% ink. Hover royal fill, white text, same blue ring. `.md-btn-gold` is not in the organic override block, so it keeps the crest gold gradient unless a more specific rule hits it. |
| `[aria-pressed='true']` on gold | switches to brand gradient and white text | still the crest rule |

### Catalog pills

Clear / try-again buttons on news, team, events, sponsors, tournaments, matches: `padding: 10px 20px`, `border-radius: 999px`, `font-weight: 700`, `font-size: 14px`, background `#1677d2`, text `#ffffff`, hover `#104a91`. No border.

### Pagination (`MdPagination.tsx`)

Previous and Next: inline-flex, gap `0.5rem`, padding `0.625rem 1.25rem` (`0.5rem 0.7rem` under `520px`), border `2px`, radius `0.5rem`, weight 700. Icons are 20px strokes (`1.25rem`, stroke width `2.5`). Hover scale `1.05` except under `prefers-reduced-motion`. Organic colours are in section 3.1. Page pill and count pill sit in the bar; the count is centered (`width: fit-content; margin-inline: auto`). Labels are uppercase Barlow Condensed on organic pages.

### Header and chip buttons

Nav items are text buttons/links, not filled buttons, except the white-8% hover pill. Athlete sport chips are `border-radius: 999px`, transparent, uppercase `0.75rem`. Active: gold fill, navy text. About CTAs use `.md-about-cta` (filled) and `--ghost`.

### Global / admin-style buttons

Older pages and unused admin CSS use Tailwind blue-100 / blue-700 buttons (`pagination_footer` pattern, dialog pattern). Those classes are not what `.md-organic` buttons use. Radix `AlertDialog` on membership uses the dialog button pattern (h-14, rounded-xl, blue cancel, red confirm) when that component is mounted.

---

## 9. Cards

| Variant | Radius | Surface | Shadow / border | Hover | Page |
|---|---|---|---|---|---|
| Hero panels | `rounded-3xl` (24px) | crest card and slider | slider shadow in `.md-hero-slider` | slider image scale where implemented | Home |
| News lead / row | from `.md-nw-lead`, `.md-nw-row` | white | soft card shadow in the news CSS | arrow circle fills `#1677d2` | `/news` |
| Most-read | `20px` | navy gradient | `0 2px 4px rgba(7,27,56,0.1), 0 14px 32px rgba(7,27,56,0.24)` | link colour | `/news` |
| Team person | card in `.md-tm-grid` | white | shadow in `.md-tm` block | lift if the block sets `translate` | `/team` |
| Player hero photo | contain, drop-shadow `0 28px 36px rgba(0,0,0,0.45)` | none (cutout) | gold spot behind | none on the photo | `/team/[id]` |
| Honour chip | `999px` | `rgba(255,255,255,0.06)`, gold border 45% | — | gold fill, navy text | player |
| Event card | `.md-ev` card | white | catalog shadow | — | `/events` |
| Match card | `.md-mc-card` | white | — | — | `/matches` |
| Sponsor row / tile | `.md-sp` and `.md-sponsor-tile` | white | strip shadow | logo scale suppressed when reduced-motion or `.is-shown` rules say `transform: none` | `/sponsors`, home |
| Tournament card | `.md-tn-card` | white | — | view link | `/tournaments` |
| About cards | `.md-about-card` | white / band | — | reveal on scroll class | `/about` |
| Gallery tile | gallery grid | white or image fill | `sacred-shadow` tokens exist for an older gallery; the FC gallery uses `.md-gallery-*` | shimmer / rise | `/gallery` |
| Empty state | `18px` | `#ffffff`, centered | — | blue pill | catalogs |
| Ad slot | `16px` | `#f6f9fc`, dashed `#8fb4e0` | — | — | `/news` |

Team partner logos: height `52px`, `object-fit: contain`, `filter: grayscale(1)`, opacity `0.6`, hover restores colour (`.md-tm-partners img`).

---

## 10. Tables, lists, and data

- League standings: `LeagueStandingsTable.tsx`. Header and rows are a standard table. Numbers use `tabular-nums` from `.md-brand :is(table, time, .tabular-nums)`.
- Homepage standings: `.md-live-row` with top border `border-pitch-chalk/10`.
- Match list: grouped by month or “Results”, count chip on the group title.
- News and roster: not tables. They are cards plus a pager.
- Typeahead listbox: `FcCatalogTypeahead.tsx`, class `.md-typeahead`, cap 20 (`CATALOG_SUGGESTION_LIMIT`). Listbox styles are the shared `.md-typeahead [role='listbox']` rules in `globals.css`. Typing updates the menu only. Enter, a suggestion, or “Click Enter for more” commits the query.
- Pagination: `MdPagination`. Zero-based page. Label “Page {n} of {total}” and “Showing {start} to {end} of {count} {noun}”. Hidden when `totalCount` is 0. Gallery empty uses a count line: “No albums/events found”.
- Sort on the roster: Number and Name buttons, `aria-pressed`.
- Filters: tabs with counts, chips, date inputs, squad `<select>`.
- Loading: skeleton blocks (sponsors `.md-sp-skeleton`, shimmer 1.4s) and spinners (`.md-ev-spin`, `.md-tn-spin`, 36px, track `#d5e2f2`, top `#104a91`).
- Empty copy is a heading plus one sentence and, when a filter is on, “Clear search”.

There is no zebra strip defined on the public standings table in the organic overrides. If a row hover exists, it is on `.md-live-row` or the standings component classes. Do not invent a stripe colour.

---

## 11. Forms and inputs

Public catalogs:

- Search: `FcCatalogTypeahead`. Combobox `role="combobox"`, listbox, options use `onMouseDown` preventDefault. On news and team the field is a pill inside the filter card (`.md-nw-filtercard .md-typeahead`, `.md-tm-row > .md-typeahead`).
- Dates on events: native date inputs labeled From and To.
- Squad and other selects: native `<select>` inside the filter row.
- Contact and volunteer: `FcUnitedContactForm` and the volunteer page fields. Focus ring for inputs on `body.md-public`: `2px solid #ffd166`, offset `2px`, glow `0 0 0 4px rgb(255 209 102 / 0.22)`, transition `--md-dur-fast`.

Validation pattern used elsewhere in the repo (profile and similar, `form_validation_styling` rule): `border-red-500`, message `text-red-500 text-sm`, summary box `bg-red-50`. That pattern is not automatically on every public catalog field.

Checkboxes in older CSS (around the “Checkbox” comment in `globals.css`) follow a separate admin rule. Public filters are tabs and chips, not checkbox lists.

File upload and rich date pickers are not part of the public catalogs. Event checkout pages may include Stripe and other payment fields; those are third-party UI.

---

## 12. Backgrounds and effects

| Effect | Where | Implementation |
|---|---|---|
| Cloud page | `.md-organic` | solid `#f4f7fb` |
| Navy hero | `.md-organic .md-hero-stage` | linear `#071b35` → `#0b2547` plus a green radial at the bottom (`rgba(8, 115, 75, 0.45)`) |
| Hero lights | `.md-hero-lights` and children | absolute fill, keyframes listed in section 13 |
| Inner hero wash | `.md-inner-hero-wash` | `linear-gradient(100deg, rgba(7,27,56,0.94), rgba(11,45,89,0.82), rgba(7,27,56,0.62))` |
| Forest band remap | `section.bg-pitch-forest` on public pages | navy linear plus royal radial |
| Footer wash | `.md-organic footer` | royal radial over navy |
| Header glass | `::before` | `backdrop-filter: blur(14px) saturate(140%)` |
| Player grid | `.md-athlete-hero::before` | 1px white lines at 4.5% opacity, 72px, masked to the left 72% |
| Player spot | `.md-athlete-hero__spot` | gold/royal radial, `filter: blur(2px)` |
| Stadium hairline | `body.md-public .md-sport-bg` | `inset 0 1px 0 rgba(255,255,255,0.07)` |
| News most-read | `.md-nw-most` | navy gradient, large shadow |
| Ad stripes | `.md-nw-ad` | repeating 135deg royal tint |
| Partner grey | `.md-tm-partners img` | `grayscale(1)` |
| Gold button sweep | `.md-btn-primary::after` before organic override | translating white gradient. Organic primary sets `filter: none` and a flat fill; the `::after` element can still exist |
| Matchday glass header | `.md-strikers-header::before` without organic | brown glass, blur 28px. Replaced on `.md-organic` |
| Parallax | `useSportsParallax.ts` | scroll-linked motion for sport backgrounds. Organic hides `.md-sport-icons` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` | animations on header, hero, menu, pagination, and public links collapse |

No background video is set on the public shell. No cursor-follow effect is defined in the organic CSS. Image masks exist on the athlete grid and on hero decorations, not as a general image component.

---

## 13. Motion

Durations: `--md-dur-fast: 160ms`, `--md-dur: 320ms`, `--md-dur-slow: 640ms`. Easing: `--md-ease-out: cubic-bezier(0.2, 0.8, 0.2, 1)`, `--md-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`, `--md-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`.

| Animation | Element | Trigger | Duration | Easing | Source |
|---|---|---|---|---|---|
| `md-header-glass-in` | header `::before` | load | 1.2s | ease-out curve | `@keyframes` translateY -18px |
| `md-menu-in` | mobile menu | open | defined in keyframes | — | `globals.css` |
| `md-rise`, `md-reveal-up`, `md-grow-x` | public reveals | load / in-view class | keyframes | — | `globals.css` |
| `md-kenburns`, `md-breathe`, `md-wash` | hero imagery | infinite / load | keyframes | — | `globals.css` |
| `mdBowlDrift`, `mdWash`, `mdBeamL`, `mdBeamR`, `mdMote`, `mdSweep` | `.md-hero-lights` | load | keyframes | — | homepage hero |
| `md-about-drift`, `md-about-rise` | `.md-about-reveal` | about page | keyframes | — | about |
| `md-gallery-*` | gallery | load | includes a spin | linear spin | gallery |
| `md-contact-drift/rise/spin` | contact | load | spin to 360deg | — | contact |
| `md-athlete-in/zoom/bar/medal` | player | load | keyframes | — | player |
| `md-league-in/sheen/pulse` | leagues | load | keyframes | — | leagues |
| `md-lg-live`, `md-tn-live` | live dot | infinite | box-shadow 0 → 9px | — | leagues, tournaments |
| `md-sp-shimmer` | sponsor skeleton | infinite 1.4s | background-position | ease | sponsors |
| `md-ev-spin`, `md-tn-spin`, `md-gallery-spin`, `md-contact-spin` | spinners | loading | rotate 360 | linear | catalogs |
| `ticker-marquee`, `marquee-slow` | tickers | infinite | 30s for Tailwind `marquee-slow` | linear | Tailwind + CSS |
| Button hover | `.md-btn` | hover | 320ms | ease-out | translateY -2px |
| Pagination hover | `.md-pagination__*` | hover | 300ms | — | scale 1.05 |
| Nav underline | header `after:` | hover | 300ms | — | scaleX |
| Footer underline | `footer nav a` | hover | 320ms | ease-out | background-size |
| Chevron | header dropdown | hover | 300ms | — | rotate 180 |
| Dropdown | submenu | hover / focus-within | 200ms | — | opacity, translate |
| Reduced motion | public `a, button` | always when OS asks | 1ms | — | `body.md-public` media query |

Delay is **not explicitly defined** on these keyframes unless a rule sets `animation-delay`. Do not assume stagger.

---

## 14. Images, icons, and media

- Club logo: `/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png`. Header height 96 / 112px. Footer height `h-28` / `md:h-32`. `width`/`height` attributes 1003×858 so the ratio is stable. `alt=""` on the header image because the link has `aria-label="MD Strikers Home"`. Footer image `alt="MD Strikers"`.
- Hero and catalog photos: `object-cover` for tiles that fill a fixed frame, `object-contain` for logos and the player cutout. Player photo: `object-fit: contain`, `object-position: center bottom`, `height: min(560px, 68vh)`.
- News covers: `<img>` inside `.md-nw` cover frames (lead vs row).
- Next/Image is used for logos, roster photos, and sponsor marks. Some news covers are plain `<img>`.
- Icons: inline SVG, `viewBox="0 0 24 24"`, stroke `currentColor`, width about 2. Footer social icons are 20px (`h-5 w-5`), one filled (Facebook, YouTube) and one stroked (Instagram). Map pin and mail icons in the footer are stroked, `h-5 w-5`, colour utility `text-pitch-lime` (organic footer text rules may flatten link colour; the SVG uses `currentColor`).
- Lucide is for the global header, not the club header.
- Gallery and event images must stay fully visible when the containment rules apply (`object-contain`, `h-auto`). Catalog thumbnails that are decorative fills use `object-cover`.
- Lazy loading: Next/Image default. Header logo sets `priority`.
- Video: not part of the public shell. Embeds in news ads render through `dangerouslySetInnerHTML` when `embedHtml` is set (`.md-nw-ad__html iframe { max-width: 100% }`).

---

## 15. Tailwind and styling architecture

- Version: Tailwind CSS 3.4, plugin `tailwindcss-animate` only.
- Content globs: `src/pages`, `src/components`, `src/app`.
- `darkMode: ["class"]`. The public shell does not toggle a dark class. It is a light page with dark chrome.
- Container: centered, padding `2rem`, `2xl` screen `1400px`. Public shells mostly use `max-w-[1240px]` instead of `container`.
- Radius: `lg` = `var(--radius)`, `md` and `sm` subtract 2px and 4px. `--radius` is the shadcn token.
- Custom shadows: `shadow-pitch`, `shadow-pitch-soft`, `shadow-brand`, plus Syro shadows.
- Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) plus `syro-tablet` 991px and `syro-mobile` 576px.
- Architecture: hybrid. Public pages are mostly global CSS class prefixes (`.md-nw`, `.md-tm`, `.md-ev`, `.md-mc`, `.md-sp`, `.md-tn`, `.md-about`, `.md-athlete`) plus a thin layer of Tailwind on headers, footers, and shells (`cn()` from `src/lib/utils`). There are no CSS modules on the club shell. No styled-components.
- Conditional classes: `cn()` / `clsx` patterns, `data-scrolled`, `data-tone`, `aria-pressed`, `aria-current`.
- `pitch-*` and `brand-*` are the intended utility API. On `.md-public-page` many of those utilities are overridden in raw CSS, so the utility name and the painted colour differ. When reproducing a public page, copy the organic override, not the raw `bg-pitch-charcoal` crimson.

---

## 16. Responsive behaviour

| Breakpoint | Range | What changes |
|---|---|---|
| default | &lt; 640px | One-column catalogs. Header logo only (wordmark hidden). Primary nav hidden. Mobile menu. Pagination padding tightens at `520px`. Organic page inset `0.75rem`. |
| `sm` 640px | ≥ 640px | Header wordmark visible until `xl`. Some footer columns become two. |
| `md` 768px | ≥ 768px | Header height grows. Footer padding grows. Organic inset `1rem`. Homepage story padding `py-32`. Hero logo headings stay white/navy per organic rules. Athlete hero grid is two columns until its own mobile rule. |
| `lg` 1024px | ≥ 1024px | Footer becomes four columns. Card grids that use `lg:grid-cols-4` (older galleries) reach four columns. |
| `xl` 1280px | ≥ 1280px | Desktop nav appears (`xl:flex`). Wordmark hides (`xl:hidden`). |
| `2xl` 1536px | ≥ 1536px | Nav gap increases to `gap-5`. Tailwind container caps at 1400px; the club header on organic is `max-width: none`. |
| `max-width: 720px` | catalogs | Team, events, matches, and news stacks (search full width, one card column) live in each prefix’s media block. |
| `max-width: 520px` | pagination | Smaller horizontal padding so Previous, page pill, and Next stay on one row. |
| `prefers-reduced-motion` | any width | Transforms and long transitions removed for public controls. |

Athlete hero: `grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr)` and `min-height: 540px`. A later `@media` in the athlete block stacks this; read that query before assuming the two-column layout on a phone.

---

## 17. Overlays, menus, and dialogs

| Overlay | Position | Surface | Motion |
|---|---|---|---|
| Desktop nav menu | `absolute`, `top-full`, `z-50`, centered on the item | `#152b49`, gold top border, `rounded-xl`, `shadow-pitch` | 200ms opacity and translate. Invisible until hover or focus-within |
| Mobile menu | `#fc-united-mobile-menu` under the header | navy, white text | `md-menu-in`; none when reduced motion |
| Typeahead listbox | under the input, `.md-typeahead [role='listbox']` | white panel, shadow in the typeahead CSS | opens while the draft is non-empty |
| Player dock | `sticky`, `top: 4.6rem`, `z-index: 40` | `rgba(7,27,53,0.94)`, blur 14px | colour/transform 0.35s on chips |
| Alert dialog | Radix, portaled | used on membership cancel flows | Radix defaults plus dialog button classes where applied |
| Clerk modal | Clerk | sign-in routes | not styled by `.md-nw` / `.md-tm` |
| AdSense consent | `AdSenseConsentBanner` | footer includes it | banner, not a catalog modal |

Tooltip `title` attributes exist on icon buttons and social links. A custom tooltip style exists for older admin action buttons (comment “Instant tooltip” in `globals.css`). Public catalogs use native `title` plus `aria-label`.

Z-index layers that are explicit: header `50`, dropdown `50`, player dock `40`, hero lights `0`, hero copy `1`. A full z-index scale is **not explicitly defined**.

---

## 18. Reusable components

| Component | Path | Role | Visual props |
|---|---|---|---|
| `FcUnitedHeader` | `src/components/fc-united/FcUnitedHeader.tsx` | Sticky navy bar | `active` key |
| `FcUnitedFooter` | `src/components/fc-united/FcUnitedFooter.tsx` | Navy footer | none |
| `FcUnitedMobileNav` | `src/components/fc-united/FcUnitedMobileNav.tsx` | Drawer | open state |
| `FcCatalogTypeahead` | `src/components/fc-united/FcCatalogTypeahead.tsx` | Search combobox | `draft`, `suggestions`, `bare`, `leading` |
| `MdPagination` | `src/components/fc-united/MdPagination.tsx` | Pager | `page`, `pageSize`, `totalCount`, `itemLabel` |
| `FcUnitedRosterBoard` | `src/components/fc-united/FcUnitedRosterBoard.tsx` | Team and executive board | squad, search copy, card link vs article |
| `MatchCentreView` | `src/components/fc-united/MatchCentreView.tsx` | Matches | — |
| `LeagueStandingsTable` | `src/components/fc-united/LeagueStandingsTable.tsx` | Table | — |
| `HeroSlider` | `src/components/fc-united/HeroSlider.tsx` | Home slider | — |
| `ClubMark` | `src/components/fc-united/ClubMark.tsx` | Crest mark | — |
| `FcUnitedInnerHero` | `src/components/fc-united/FcUnitedInnerHero.tsx` | Inner page hero | title, crumb |
| `pitchUi.tsx` | `src/components/fc-united/pitchUi.tsx` | Shared pitch class fragments | — |
| `ConditionalLayout` | `src/components/ConditionalLayout.tsx` | Skips global chrome on standalone routes | pathname |
| `Header` / `Footer` | `src/components/Header.tsx`, `Footer.tsx` | Non-shell chrome | admin flag is not passed on this public tenant |

Class prefixes to search when matching a page: `md-nw` news, `md-tm` team, `md-ev` events, `md-mc` matches, `md-sp` sponsors, `md-tn` tournaments, `md-lg` leagues, `md-about` about, `md-athlete` player, `md-gallery` gallery, `md-contact` contact.

---

## 19. CSS reference

File: `src/app/globals.css` (single global sheet, about 9,000 lines). Order matters: Matchday tokens and `.md-btn` come first; `.md-organic` overrides come later and win.

| Token | Value | Line area |
|---|---|---|
| `--md-dur-fast` / `--md-dur` / `--md-dur-slow` | 160 / 320 / 640 ms | Matchday `:root` |
| `--radius-button` | `0.5rem` | same |
| `--gradient-brand` | 135deg `#ef3022` → `#f47b20` | same |
| `--gradient-gold` | `#ffe08a` → `#ffc247` → `#ffad1f` | same |
| `--md-navy` and siblings | section 3.1 | `.md-organic` |
| `--md-header-h` | 112 / 128 or 72 / 80 px | header component |
| Shell width | `1240px` | header and footer `Shell` |
| Organic inset | 0.75rem, 1rem from 768px | `.md-organic main > section` |
| Focus | 2px `#ffd166` or `#104a91` | inputs vs pagination |

`src/app/layout.tsx` imports `globals.css` once. Club pages do not add a CSS module.

---

## 20. Page comparison

Shared on every standalone club page: sticky navy header, cloud background, condensed uppercase headings, royal pills, navy footer, Barlow body.

| Difference | Pages |
|---|---|
| Full-bleed hero with lights and a slider | Home only |
| Overlapping filter card and catalog pager | News, team, executive, events, matches, sponsors, tournaments, gallery |
| Athlete hero, gold stroke number, sticky dock | `/team/[id]` only |
| Timeline and about-specific cards | `/about` |
| Standings table | Home band, `/leagues/[slug]` |
| Ads inside the feed | `/news` only |
| Global indigo header instead of the club header | Membership, polls, calendar, dashboard, tasks, philanthrop, charity, and any route not listed in `isFcUnitedStandaloneRoute` |
| Crest crimson utilities | Any component that uses `bg-pitch-*` outside `.md-public-page` overrides |
| Blue-100 admin buttons | Unused `EventsCatalogClient`, older dialogs, calendar count chip (indigo, not royal) |

Inconsistencies that are in the source today:

- `:root` says the crest theme avoids black and white page backgrounds. Organic cards are `#ffffff` and the footer is `#071b38`.
- `body.md-public` sets the canvas to `#171717` while `.md-organic` paints `#f4f7fb`.
- `.md-btn-gold` stays on the crest gold gradient. `.md-btn-primary` becomes royal.
- Footer component asks for a gold top border; organic CSS sets a royal 3px top border.
- Heading colour `#222` is immediately overridden to white on navy bands, so light-on-light headings should not be assumed.
- News, team, and events empty buttons are raw CSS pills, not `.md-btn`.

---

## 21. Interaction and accessibility states

Verified behaviours:

- Focus: header links use `focus-visible:ring-2` (component) and inputs on `body.md-public` use a gold ring. Pagination uses `outline: 2px solid #104a91`.
- Disabled: pagination keeps a lighter royal mix and `cursor: not-allowed`. `.md-btn:disabled` uses opacity `0.5`.
- `aria-pressed` on sort and filter chips. `aria-current` is styled on gold buttons.
- `prefers-reduced-motion: reduce` removes motion on the public shell and shortens transitions to 1ms.
- Icon-only controls expose `aria-label` (social, pagination, menu, logo link).
- Touch targets: social buttons are 44px (`h-11 w-11`). Pagination buttons are about 44px tall on small screens (`h: 44` measured from padding and line-height). Nav text links are shorter than 44px; height is the header line, not a 44px hit box. That is what the CSS does, not a claim of WCAG compliance.
- Contrast: navy `#071b38` on cloud and white on navy are the main pairs. Gold `#ffc857` is used for small uppercase labels on navy. `#ffc857` on white is not the body-text pair. No contrast audit was run for this document.
- Alt text: decorative header logo is empty because the link is named. Content images should use the name or title the component passes. News cover images in `Cover` use `alt=""`.

---

## 22. Design tokens

### Colour

See sections 3.1 and 3.2. Repeat values: `#071b38`, `#104a91`, `#1677d2`, `#ffc857`, `#f4f7fb`, `#ffffff`, `#c3d3e8`, `#10233f`, `#60738c`.

### Type

Barlow body, Barlow Condensed 800 uppercase headings, tracking `0.02em` on headings, `0.06em` on nav and buttons.

### Space

| Token | Value |
|---|---|
| Shell padding | 16px / 24px / 32px (`px-4 sm:px-6 lg:px-8`) |
| Organic inset | 12px, 16px from 768px |
| Footer padding | 80px top / 64px bottom, 96px / 80px from `md` |
| Catalog empty padding | `56px 24px` |
| Button padding | `0.75rem 1.5rem` (`.md-btn`), `10px 20px` (catalog pills), `0.625rem 1.25rem` (pagination) |

### Width

| Token | Value |
|---|---|
| Header/footer shell | `1240px` (organic header overrides to none) |
| Tailwind container 2xl | `1400px` |
| Dropdown | min `13rem` |
| Player photo spot | `min(420px, 80%)` |

### Radius

| Token | Value |
|---|---|
| `--radius-button` | `0.5rem` |
| Organic `.md-btn` and chips | `999px` |
| Pagination | `0.5rem` |
| Hero panels | `1.5rem` (`rounded-3xl`) |
| Dropdown | `0.75rem` (`rounded-xl`) |
| Empty cards | `18px` |
| Most-read | `20px` |

### Shadow

| Name | Value |
|---|---|
| `shadow-pitch` | `0 24px 48px -24px rgba(0, 0, 0, 0.55)` |
| Header scrolled | `0 12px 28px rgba(2, 10, 28, 0.35)` |
| Primary hover | `0 10px 24px rgba(16, 74, 145, 0.28)` plus `0 0 0 4px #eaf3fc` |
| Player photo | `0 28px 36px rgba(0, 0, 0, 0.45)` |
| Most-read | `0 14px 32px rgba(7, 27, 56, 0.24)` |

### Z-index

Header 50. Dropdown 50. Dock 40. Hero lights 0. Anything else is **not explicitly defined**.

---

## 23. Source index

| Concern | File |
|---|---|
| Global CSS, tokens, organic overrides, catalog skins, keyframes | `src/app/globals.css` |
| Tailwind theme | `tailwind.config.ts` |
| Fonts and `fcPublicShell` | `src/components/fc-united/fcUnitedFonts.ts` |
| Which routes skip the global chrome | `src/lib/fcUnitedRoutes.ts` |
| Root layout and `body.md-public` | `src/app/layout.tsx` |
| Header | `src/components/fc-united/FcUnitedHeader.tsx` |
| Nav model | `src/components/fc-united/fcUnitedNavLinks.ts` |
| Mobile nav | `src/components/fc-united/FcUnitedMobileNav.tsx` |
| Footer | `src/components/fc-united/FcUnitedFooter.tsx` |
| Home | `src/components/fc-united/FcUnitedHomePage.tsx` |
| About | `src/components/fc-united/FcUnitedAboutPage.tsx` |
| News | `src/components/fc-united/FcUnitedNewsPage.tsx` |
| Article | `src/components/fc-united/FcUnitedNewsArticlePage.tsx` |
| Team / executive board | `src/components/fc-united/FcUnitedRosterBoard.tsx` |
| Player | `src/components/fc-united/FcUnitedPlayerPage.tsx` |
| Events | `src/components/fc-united/FcUnitedEventsCatalogClient.tsx` |
| Matches | `src/components/fc-united/MatchCentreView.tsx` |
| Sponsors | `src/components/fc-united/FcUnitedSponsorsCatalogClient.tsx` |
| Tournaments | `src/components/fc-united/FcUnitedTournamentsCatalogClient.tsx` |
| Leagues | `src/components/fc-united/FcUnitedLeaguesCatalogClient.tsx`, `FcUnitedLeagueDetail.tsx` |
| Gallery | `src/components/fc-united/FcUnitedGalleryPage.tsx` |
| Contact | `src/components/fc-united/FcUnitedContactsPage.tsx`, `FcUnitedContactForm.tsx` |
| Search | `src/components/fc-united/FcCatalogTypeahead.tsx` |
| Pagination | `src/components/fc-united/MdPagination.tsx` |
| Global chrome | `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ConditionalLayout.tsx` |

When a catalog skin and a Tailwind utility disagree, the later `.md-organic` rule in `globals.css` is the one on screen.
