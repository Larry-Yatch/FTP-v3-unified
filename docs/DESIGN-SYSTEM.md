# Financial TruPath V3 — Design System Guide

This document is the single source of truth for the visual language of Financial TruPath V3. Any tool, slide deck, report, or external asset built for this platform should follow these standards to maintain a consistent look and feel.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Border Radii](#border-radii)
6. [Shadows & Elevation](#shadows--elevation)
7. [Animation System](#animation-system)
8. [Components](#components)
   - [Buttons](#buttons)
   - [Cards](#cards)
   - [Forms & Inputs](#forms--inputs)
   - [Badges](#badges)
   - [Messages & Alerts](#messages--alerts)
   - [Progress Bar](#progress-bar)
   - [Range Sliders](#range-sliders)
   - [Navigation Bar](#navigation-bar)
   - [Loading States](#loading-states)
9. [Background Treatment](#background-treatment)
10. [Utility Classes](#utility-classes)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Accessibility](#accessibility)
13. [CSS Variables Reference](#css-variables-reference)

---

## Brand Identity

**Platform:** Financial TruPath V3 (FTP-v3)

**Aesthetic:** Dark, premium, trust-inspiring. The visual design communicates psychological depth and financial seriousness without being cold. The dark purple background paired with warm gold accents creates a sense of wisdom, warmth, and elevated professionalism.

**Tone:** Premium financial platform with a human, trauma-informed heart. Never clinical. Never flashy.

**Core visual metaphors:**
- Dark deep purple = depth, introspection, safety
- Gold/bronze = value, warmth, achievement
- Blur + transparency = layers, nuance, depth
- Soft glow = guidance, illumination

---

## Color Palette

### CSS Custom Properties

All colors are defined as CSS variables on `:root` and must be used via these tokens — never hardcode hex values in component code.

```css
:root {
  --bg:           #1e192b;                              /* Page background — deep purple */
  --bg-gradient:  linear-gradient(135deg, #4b4166, #1e192b); /* Body gradient */
  --card:         rgba(20, 15, 35, 0.9);               /* Card surface */
  --text:         #ffffff;                              /* Primary text */
  --muted:        #94a3b8;                              /* Secondary / subdued text */
  --accent:       #ad9168;                              /* Primary accent (alias of --gold) */
  --gold:         #ad9168;                              /* Gold — primary brand color */
  --accent-blue:  #188bf6;                              /* Blue — secondary accent */
  --border:       rgba(173, 145, 104, 0.2);             /* Borders and dividers */
  --ok:           #9ae6b4;                              /* Success / positive */
  --warn:         #f59e0b;                              /* Warning */
  --bad:          #ef4444;                              /* Error / negative */
}
```

### Color Reference Table

| Name | Token | Hex / Value | Usage |
|------|-------|-------------|-------|
| Background | `--bg` | `#1e192b` | Page background |
| Background Gradient | `--bg-gradient` | `135deg, #4b4166 → #1e192b` | Body gradient (fixed attachment) |
| Card Surface | `--card` | `rgba(20, 15, 35, 0.9)` | Card and container backgrounds |
| Primary Text | `--text` | `#ffffff` | All body and heading text |
| Muted Text | `--muted` | `#94a3b8` | Labels, captions, secondary info |
| Gold (Primary Accent) | `--gold` | `#ad9168` | Buttons, borders, highlights, icons |
| Blue (Secondary Accent) | `--accent-blue` | `#188bf6` | Info states, progress fills, links |
| Border | `--border` | `rgba(173, 145, 104, 0.2)` | All borders and dividers |
| Success | `--ok` | `#9ae6b4` | Positive states, success messages |
| Warning | `--warn` | `#f59e0b` | Caution states |
| Error | `--bad` | `#ef4444` | Error states, validation failures |
| Button Text on Gold | *(hardcoded)* | `#140f23` | Dark text used on gold/filled buttons |

### Color Usage Rules

- **Gold (`--gold`)** is the primary action color. Use it for primary buttons, active borders, and any element that draws the eye toward action.
- **Blue (`--accent-blue`)** is the secondary accent. Use it for informational callouts, progress bars (paired with gold), and non-primary links.
- **Never use raw hex values** in component styles. Always reference the CSS variable so theme changes propagate automatically.
- **Gold on dark:** `#ad9168` on `#1e192b` — this is the primary pairing.
- **Dark on gold:** `#140f23` on `#ad9168` — used for filled button text.

---

## Typography

### Fonts

Both fonts are loaded from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');
```

| Font | Role | Weights Available |
|------|------|------------------|
| **Radley** (serif) | Headings (h1–h6) | 400 only |
| **Rubik** (sans-serif) | Body, UI, labels, buttons | 300, 400, 500, 600, 700 |

### Type Scale

| Element | Font | Size | Weight | Color | Notes |
|---------|------|------|--------|-------|-------|
| `h1` | Radley | 35px | 400 | `--text` | `letter-spacing: 0.5px`, `margin-bottom: 16px` |
| `h2` | Radley | 26px | 400 | `--gold` | `margin-bottom: 20px` |
| `h3` | Radley | 22px | 400 | `--text` | `margin-bottom: 15px` |
| Body | Rubik | 15px | 400 | `--text` | Base font size |
| `.muted` | Rubik | 13px | 400 | `--muted` | Captions, secondary labels |
| Buttons | Rubik | 14px | 500 | — | Uppercase, `letter-spacing: 0.5px` |
| `.badge` | Rubik | 12px | 500 | `--gold` | Uppercase, `letter-spacing: 0.5px` |
| `.btn-nav` (calculator) | Rubik | ~15px (0.95rem) | 700 | `#140f23` | Nav pill in calculator tools |
| Small labels | Rubik | 13px | 400 | `--muted` | Progress text, sub-labels |

### Typography Rules

- Headings always use **Radley**. Never use Rubik for headings, never use Radley for body text.
- `h2` is always gold — it functions as a section title.
- Body text is always white (`--text`). Use `--muted` (`#94a3b8`) for anything secondary.
- Buttons are **uppercase with letter spacing** — this gives the UI a refined, premium feel.
- Minimum readable size is **12px** (badges). Do not go below this.

---

## Spacing & Layout

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
}
```

The maximum content width is **1200px**, centered on the page.

### Base Spacing

| Purpose | Value |
|---------|-------|
| Body padding | `24px` (desktop) / `15px` (mobile) |
| Card padding | `20px` |
| Login container padding | `40px` |
| Form group margin | `20px` bottom |
| Section card body padding | `24px` |
| Section card header padding | `20px 24px` |
| Tool navigation padding | `12px 20px` |

### Grid

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
```

Standard two-column form layout with **20px gap**. Collapses to single column at 768px.

---

## Border Radii

| Element | Radius |
|---------|--------|
| Cards, containers, login box | `20px` |
| Pill buttons (`.btn`, `.btn-primary`, `.btn-secondary`) | `50px` |
| Tool cards | `15px` |
| Text inputs, selects (pill) | `50px` |
| Textarea | `15px` |
| Messages / alerts | `12px` |
| Section cards (calculator tools) | `12px` |
| Badges | `20px` |
| Progress bar track | `4px` |
| Nav bar | `15px` |

**Rule:** Pills (50px radius) are for interactive action elements. Rounded rectangles (12–20px) are for containers and informational elements.

---

## Shadows & Elevation

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-hover` | `0 4px 12px rgba(0, 0, 0, 0.15)` | Button / card hover lift |
| `--shadow-active` | `0 2px 8px rgba(0, 0, 0, 0.1)` | Button press depression |
| `--shadow-elevated` | `0 6px 20px rgba(173, 145, 104, 0.2)` | Tool card hover (gold glow) |
| Card default | `0 8px 30px rgba(0, 0, 0, 0.4)` | Base card shadow |

**Elevation hierarchy:** Cards sit at the base level. Interactive elements (buttons, tool cards) rise on hover. The golden glow shadow (`--shadow-elevated`) is reserved for tool cards — it signals "this is something you can engage with."

---

## Animation System

The animation system is hardware-accelerated and uses CSS custom properties for all timing values. Every animation in the platform flows through these tokens.

### Duration Tokens

```css
--duration-instant:  100ms;   /* Immediate micro-feedback */
--duration-fast:     200ms;   /* Focus rings, toggles, checkboxes */
--duration-normal:   250ms;   /* Buttons, hover transitions */
--duration-medium:   300ms;   /* Page transitions, collapsibles */
--duration-entrance: 350ms;   /* Cards and containers entering the DOM */
--duration-feedback: 600ms;   /* Ripple effects */
--duration-loading:  800ms;   /* Spinner rotation cycle */
```

### Easing Tokens

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);      /* Default — most interactions */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);  /* Entrances, checkbox pop */
--ease-smooth:   ease-in-out;                          /* Pulses, page transitions */
--ease-linear:   linear;                               /* Spinners only */
```

### Named Keyframe Animations

| Name | Effect | Primary Use |
|------|--------|-------------|
| `zoomIn` | Scale 0.8 → 1 with bounce easing | Card/container entrance |
| `fadeIn` | Opacity 0 → 1 | Page navigation entrance |
| `fadeOut` | Opacity 1 → 0 | Page navigation exit |
| `slideInRight` | Translate +30px → 0 + fade | Forward page transition |
| `slideInLeft` | Translate -30px → 0 + fade | Back page transition |
| `rotate` | 360° continuous | Loading spinners |
| `pulse` | Opacity 1 → 0.5 → 1, 2s loop | Async waiting states |
| `shimmer` | Gold gradient sweep | Skeleton loading states |
| `ripple` | Circle expands to 300px, fades | Material click feedback |
| `shake` | Horizontal oscillation | Error / validation failure |
| `successBounce` | Vertical bounce | Success confirmation |
| `checkboxPop` | Scale 1 → 1.1 → 1 | Checkbox selection |
| `checkmarkDraw` | Checkmark draws in | Checkbox fill |
| `spin` | 360° continuous | Calculator overlay spinner |

### Hover & Active States (Buttons and Cards)

```css
/* Hover — lift and scale */
transform: translateY(-2px) scale(1.02);
box-shadow: var(--shadow-hover);

/* Active / pressed */
transform: translateY(0px) scale(0.98);
box-shadow: var(--shadow-active);
```

Applied to: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-nav`, `.tool-card`, `.animate-hover`

### Staggered Entrance

Child elements inside `.animate-entrance-stagger` receive progressive delays:

| Child | Delay |
|-------|-------|
| 1st | 0ms |
| 2nd | 50ms |
| 3rd | 100ms |
| 4th | 150ms |
| 5th | 200ms |
| 6th | 250ms |

### `will-change` Usage

All animated elements that transform or change opacity use `will-change: transform` or `will-change: transform, opacity` to promote GPU compositing. Do not add `will-change` to elements that don't animate.

---

## Components

### Buttons

#### `.btn` — Outline Gold Pill

The default button. Transparent background with gold border. Fills with gold on hover.

```
State       Background              Text        Border
Default     transparent             --gold      2px solid --gold
Hover       --gold (#ad9168)        #140f23     none (merged)
Active      transparent (scaled)    --gold      2px solid --gold
Disabled    transparent (40% op)    --gold      2px solid --gold
```

- Padding: `12px 24px`
- Width: `100%` globally (override to `width: auto` in calculator tools)
- Font: Rubik 500, 14px, uppercase, `letter-spacing: 0.5px`

#### `.btn-primary` — Filled Gold Pill

Solid gold. Used for the primary action on any screen.

```
State       Background      Text
Default     --gold          #140f23
Hover       (lift + scale)  #140f23
Disabled    40% opacity     #140f23
```

- Padding: `12px 24px`
- No border

#### `.btn-secondary` — Ghost Gold

Smaller than primary. Used for secondary actions alongside a primary button.

```
State       Background                    Text      Border
Default     transparent                   --gold    2px solid --gold
Hover       rgba(173, 145, 104, 0.2)     --gold    2px solid --gold
```

- Padding: `10px 20px`

#### `.btn-link` — Text Link

No border, no background. Gold text with hover underline.

```
State       Opacity   Decoration
Default     1.0       none
Hover       0.8       underline
```

#### `.btn-nav` (Global) — Transparent Outline Nav

Used in tool navigation bars.

```
State       Background                      Text      Border
Default     transparent                     --text    1px solid --border
Hover       rgba(173, 145, 104, 0.2)       --text    1px solid --gold
```

- Padding: `8px 16px`
- Border-radius: `25px`
- Font: 13px

#### `.btn-nav` (Calculator Override) — Filled Gold Nav

Calculator tools override `.btn-nav` to a filled gold pill.

```
State       Background      Text        Weight
Default     --gold          #140f23     700
Hover       (lift + glow)   #140f23     700
```

- Padding: `10px 20px`
- Border-radius: `50px`

---

### Cards

#### `.card` — Standard Card

The primary container surface across all tools.

```css
background:     rgba(20, 15, 35, 0.9);
backdrop-filter: blur(10px);
border:         1px solid rgba(173, 145, 104, 0.2);
border-radius:  20px;
padding:        20px;
box-shadow:     0 8px 30px rgba(0, 0, 0, 0.4);
margin-bottom:  20px;
```

Entrance animation: `zoomIn` (350ms, ease-bounce).

#### `.tool-card` — Dashboard Tool Card

Interactive cards on the dashboard that launch tools.

```css
/* Default */
background: linear-gradient(315deg, rgba(173, 145, 104, 0.2) 0%, rgba(30, 25, 43, 0.4) 100%);
border: 1px solid rgba(173, 145, 104, 0.2);
border-radius: 15px;

/* Hover (unlocked) */
background: linear-gradient(315deg, rgba(173, 145, 104, 0.3) 0%, rgba(30, 25, 43, 0.5) 100%);
border-color: var(--gold);
box-shadow: var(--shadow-elevated);  /* Gold glow */

/* Locked / Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### `.section-card` — Collapsible Section Card (Calculator Tools)

Accordion-style containers used in Tools 4, 6, and 8.

```css
background:    rgba(255, 255, 255, 0.03);
border:        1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
margin-bottom: 24px;
overflow:      hidden;
```

**Section header:**
```css
background: rgba(79, 70, 229, 0.1);  /* Subtle indigo tint */
padding: 20px 24px;
cursor: pointer;
display: flex;
justify-content: space-between;
align-items: center;
```

**Collapsed state:** `max-height: 0`, `padding: 0 24px`, `opacity: 0`, `overflow: hidden`

#### `.login-container` — Login Box

```css
max-width:     450px;
margin:        100px auto;
padding:       40px;
background:    rgba(20, 15, 35, 0.9);
backdrop-filter: blur(10px);
border:        1px solid rgba(173, 145, 104, 0.2);
border-radius: 20px;
box-shadow:    0 8px 30px rgba(0, 0, 0, 0.4);
text-align:    center;
```

---

### Forms & Inputs

#### Standard Inputs, Selects, Textareas

```css
width:         100%;
padding:       12px 20px;
border-radius: 50px;           /* 15px for textarea */
border:        1px solid rgba(173, 145, 104, 0.2);
background:    rgba(20, 15, 35, 0.6);
color:         #ffffff;
font-family:   'Rubik', sans-serif;
font-size:     14px;
```

**Focus state:**
```css
border-color: var(--gold);
background:   rgba(20, 15, 35, 0.8);
outline:      none;
```

**Validation states:**
```css
/* Error */
border-color: var(--bad);   /* #ef4444 */

/* Success */
border-color: var(--ok);    /* #9ae6b4 */
```

**Error / success messages below inputs:**
- Font size: 14px
- Error: `var(--bad)`, Success: `var(--ok)`
- Margin-top: 5px

#### Toggle Switch

```css
/* Container */
width: 50px; height: 26px;

/* Track — off state */
background: rgba(173, 145, 104, 0.2);
border: 1px solid rgba(173, 145, 104, 0.2);
border-radius: 26px;

/* Track — on state */
background: rgba(173, 145, 104, 0.4);
border-color: var(--gold);

/* Thumb — off */
18px × 18px, background: var(--muted), left: 3px

/* Thumb — on */
background: var(--gold), translateX(24px)
```

#### Animated Checkbox

```css
/* Box — unchecked */
20px × 20px
background: transparent
border: 2px solid rgba(173, 145, 104, 0.2)
border-radius: 4px

/* Box — checked */
background: var(--gold)
border-color: var(--gold)
animation: checkboxPop

/* Check mark draws in via checkmarkDraw animation */
```

#### Focus Ring

```css
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(173, 145, 104, 0.3);
}
```

---

### Badges

Small pill labels used for status indicators and category tags.

```css
display:        inline-block;
padding:        6px 12px;
background:     rgba(173, 145, 104, 0.2);
border:         1px solid var(--gold);
border-radius:  20px;
font-size:      12px;
color:          var(--gold);
font-weight:    500;
text-transform: uppercase;
letter-spacing: 0.5px;
```

> **Note:** Tool 8 resets `.badge` to plain text (no background/border) for its specific display context. If inheriting globally, be aware of this override.

---

### Messages & Alerts

#### Base `.message`

```css
padding:       15px 20px;
margin-bottom: 20px;
border-radius: 12px;
border:        1px solid var(--border);
```

#### Variants

| Class | Background | Border | Text |
|-------|-----------|--------|------|
| `.message.error` | `rgba(239, 68, 68, 0.1)` | `#ef4444` | `#ef4444` |
| `.message.success` | `rgba(154, 230, 180, 0.1)` | `#9ae6b4` | `#9ae6b4` |
| `.message.warning` | `rgba(245, 158, 11, 0.1)` | `#f59e0b` | `#f59e0b` |
| `.message.info` | `rgba(24, 139, 246, 0.1)` | `#188bf6` | `#188bf6` |

#### Insight Box (`.insight-box`)

Used for cross-tool intelligence callouts.

```css
/* Base */
padding:    15px;
background: linear-gradient(135deg, rgba(24, 139, 246, 0.1), rgba(173, 145, 104, 0.1));
border:     1px solid var(--accent-blue);
border-radius: 12px;
margin-top: 20px;

/* .high — elevated concern */
background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(173, 145, 104, 0.1));
border-color: #ef4444;

/* .critical */
background: linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(173, 145, 104, 0.1));
border-color: #9c27b0;
```

---

### Progress Bar

```css
/* Container */
background:    rgba(20, 15, 35, 0.6);
border-radius: 15px;
padding:       20px;
margin-bottom: 25px;

/* Track */
height:        8px;
background:    rgba(173, 145, 104, 0.2);
border-radius: 4px;
overflow:      hidden;

/* Fill */
background:  linear-gradient(90deg, var(--gold), var(--accent-blue));
height:      100%;
border-radius: 4px;
transition:  width 0.5s ease;

/* Label text */
font-size:  13px;
color:      var(--muted);
```

---

### Range Sliders

#### Global Base (all tools)

```css
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--gold);
  border-radius: 50%;
  cursor: pointer;
}
```

#### Tool 6 — Critical Slider CSS (NEVER REMOVE)

Tool 6's vehicle allocation sliders require **explicit track rules** in addition to the thumb. Without these, the thumb cannot be dragged — only clicked.

```css
/* These three rules MUST exist for sliders to be draggable */
.vehicle-slider::-webkit-slider-runnable-track { /* ... */ }
.vehicle-slider::-moz-range-track              { /* ... */ }
.vehicle-slider::-webkit-slider-thumb          { margin-top: -7px; /* ... */ }
```

The `margin-top: -7px` centers the thumb vertically on the track when using `appearance: none`. Do not remove this.

---

### Navigation Bar

Used at the top of every multi-page tool to show progress and allow back/next navigation.

```css
.tool-navigation {
  background:     rgba(20, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border:         1px solid rgba(173, 145, 104, 0.2);
  border-radius:  15px;
  padding:        12px 20px;
  margin-bottom:  20px;
  display:        flex;
  justify-content: space-between;
  align-items:    center;
}
```

Navigation buttons inside use `.btn-nav` (see Buttons section for global vs. calculator variants).

---

### Loading States

#### Inline Spinner (`.loading-spinner`)

Used inline within buttons or small containers.

```css
display:      inline-block;
width:        20px;
height:       20px;
border:       3px solid rgba(173, 145, 104, 0.2);
border-radius: 50%;
border-top-color: var(--gold);
animation:    rotate 800ms linear infinite;
```

#### Overlay Spinner (`.loading-overlay` + `.spinner`)

Used by calculator tools for full-screen loading during GPT calls or heavy computation.

```css
/* Overlay */
position:   fixed;
inset:      0;
background: rgba(0, 0, 0, 0.8);
display:    flex;
align-items: center;
justify-content: center;
z-index:    9999;

/* Spinner */
width:  50px;
height: 50px;
border: 4px solid rgba(255, 255, 255, 0.1);
border-top: 4px solid var(--gold);
border-radius: 50%;
animation: spin 1s linear infinite;

/* Text */
.loading-text    { color: white; font-size: 18px; font-weight: 500; }
.loading-subtext { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 8px; }
```

#### Skeleton Loader (`.skeleton-loader`)

Gold shimmer sweep for placeholder content while data loads.

```css
background: linear-gradient(
  90deg,
  rgba(173, 145, 104, 0.1)  0%,
  rgba(173, 145, 104, 0.2) 50%,
  rgba(173, 145, 104, 0.1) 100%
);
background-size: 1000px 100%;
animation: shimmer 2s linear infinite;
```

---

## Background Treatment

### Body Background

```css
body {
  background: linear-gradient(135deg, #4b4166, #1e192b);
  background-attachment: fixed;
  min-height: 100vh;
}
```

The gradient is **fixed** — it does not scroll with content. This creates a sense of depth and stability.

### Watermark

A faint brand logo watermark sits behind all content:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('[logo url]');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 90%;
  opacity: 0.05;
  z-index: -1;
  pointer-events: none;
}
```

Opacity is **5%** — visible as a subtle texture, never competing with content.

### Glass Morphism (Cards)

Cards use `backdrop-filter: blur(10px)` with a semi-transparent background (`rgba(20, 15, 35, 0.9)`) to create a frosted glass effect layered over the fixed gradient.

---

## Utility Classes

### Spacing

| Class | Effect |
|-------|--------|
| `.mb-20` | `margin-bottom: 20px` |
| `.mt-20` | `margin-top: 20px` |
| `.p-20` | `padding: 20px` |

### Text

| Class | Effect |
|-------|--------|
| `.text-center` | `text-align: center` |
| `.muted` | `color: #94a3b8; font-size: 13px` |

### Divider

```css
.hr {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(173,145,104,0.2), transparent);
  margin: 20px 0;
}
```

### Hover Effects

| Class | Effect |
|-------|--------|
| `.hover-lift` | `translateY(-3px)` on hover |
| `.hover-scale` | `scale(1.05)` on hover |
| `.hover-glow` | `box-shadow: 0 0 20px rgba(173,145,104,0.4)` on hover |

### Animation Utilities

| Class | Effect |
|-------|--------|
| `.animate-pulse` | Opacity pulse loop (2s) |
| `.animate-shake` | Error shake (0.5s) |
| `.animate-success` | Success bounce (0.6s) |
| `.animate-ripple` | Material click ripple on `:active` |
| `.animate-spinner` | Continuous rotation |
| `.animate-hover` | Lift + scale on hover (same as buttons) |
| `.animate-entrance` | `zoomIn` entrance on mount |
| `.animate-entrance-stagger` | `zoomIn` with staggered delays on children |
| `.page-enter` | Fade in (300ms) |
| `.page-exit` | Fade out (300ms) |
| `.slide-in-right` | Slide from right + fade (300ms) |
| `.slide-in-left` | Slide from left + fade (300ms) |
| `.focus-ring` | Gold focus ring on `:focus` |

### Animation Delay Utilities

| Class | Delay |
|-------|-------|
| `.delay-0` | `0ms` |
| `.delay-50` | `50ms` |
| `.delay-100` | `100ms` |
| `.delay-150` | `150ms` |
| `.delay-200` | `200ms` |
| `.delay-300` | `300ms` |

### Animation Duration Utilities

| Class | Duration |
|-------|----------|
| `.duration-fast` | `200ms` |
| `.duration-normal` | `250ms` |
| `.duration-medium` | `300ms` |

---

## Responsive Breakpoints

| Breakpoint | Rule | Changes |
|------------|------|---------|
| `768px` | `max-width: 768px` | `.form-grid` collapses to 1 column; body padding → 15px; login margin → 50px auto |

The platform is primarily desktop-focused. The single breakpoint at 768px handles tablet and mobile.

---

## Accessibility

### Reduced Motion

All animations are disabled for users who have opted into reduced motion at the OS level:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Disabled States

All interactive elements (buttons, tool cards) at disabled state:
- `opacity: 0.4`
- `cursor: not-allowed`
- `transform: none !important` (no hover lift)

### Focus

All interactive elements should use `.focus-ring` or equivalent:
```css
outline: none;
box-shadow: 0 0 0 3px rgba(173, 145, 104, 0.3);
```

Never suppress focus indicators without providing an equivalent replacement.

---

## CSS Variables Reference

Complete list of all design tokens for quick reference:

```css
:root {
  /* ── Colors ─────────────────────────────── */
  --bg:           #1e192b;
  --bg-gradient:  linear-gradient(135deg, #4b4166, #1e192b);
  --card:         rgba(20, 15, 35, 0.9);
  --text:         #ffffff;
  --muted:        #94a3b8;
  --accent:       #ad9168;
  --gold:         #ad9168;
  --accent-blue:  #188bf6;
  --border:       rgba(173, 145, 104, 0.2);
  --ok:           #9ae6b4;
  --warn:         #f59e0b;
  --bad:          #ef4444;

  /* ── Animation Durations ─────────────────── */
  --duration-instant:  100ms;
  --duration-fast:     200ms;
  --duration-normal:   250ms;
  --duration-medium:   300ms;
  --duration-entrance: 350ms;
  --duration-feedback: 600ms;
  --duration-loading:  800ms;

  /* ── Easing Functions ────────────────────── */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:   ease-in-out;
  --ease-linear:   linear;

  /* ── Shadows ─────────────────────────────── */
  --shadow-hover:    0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-active:   0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-elevated: 0 6px 20px rgba(173, 145, 104, 0.2);
}
```

---

*This document was generated from the live source files in `/shared/styles.html` and `/shared/calculator-styles.html`. If CSS is updated, update this document to match.*
