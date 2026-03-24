# Financial TruPath v3 - Animation System Documentation

**Version:** 1.0
**Last Updated:** November 3, 2024
**Location:** `/shared/styles.html`

---

## Overview

The Financial TruPath v3 Animation System provides a comprehensive set of hardware-accelerated animations designed for smooth 60fps performance across all interactive elements. All animations respect user motion preferences for accessibility.

---

## Animation Tokens

### Durations

```css
--duration-instant: 100ms    /* Very quick interactions */
--duration-fast: 200ms       /* Toggle switches, checkboxes */
--duration-normal: 250ms     /* Button hovers, standard interactions */
--duration-medium: 300ms     /* Page transitions */
--duration-entrance: 350ms   /* Element entrances with bounce */
--duration-feedback: 600ms   /* Ripple effects, feedback */
--duration-loading: 800ms    /* Loading spinners */
```

### Easing Functions

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)    /* Material Design standard */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1) /* Bounce effect for entrances */
--ease-smooth: ease-in-out                        /* Simple smooth transitions */
--ease-linear: linear                             /* Constant speed (loading) */
```

### Shadows

```css
--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15)           /* Hover elevation */
--shadow-active: 0 2px 8px rgba(0, 0, 0, 0.1)            /* Active/pressed state */
--shadow-elevated: 0 6px 20px rgba(173, 145, 104, 0.2)   /* Card hover with brand color */
```

---

## Animation Categories

### 1. Button & Hover Animations

**Name:** Modern Scale
**Duration:** 250ms
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)
**Effect:** Smooth lift + scale for modern SaaS feel

**Usage:**
```html
<!-- Automatically applied to buttons -->
<button class="btn">Click Me</button>
<button class="btn-primary">Submit</button>
<button class="btn-secondary">Cancel</button>

<!-- Manual application -->
<div class="animate-hover">Custom Element</div>
```

**Behavior:**
- Hover: `translateY(-2px) scale(1.02)` with shadow
- Active: `translateY(0px) scale(0.98)` for press feedback

**Applied to:**
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.tool-card`, `.btn-nav`
- `.animate-hover` (utility class)

---

### 2. Entrance Animations

**Name:** Zoom In
**Duration:** 350ms
**Easing:** cubic-bezier(0.34, 1.56, 0.64, 1)
**Effect:** Scale from small with bounce - attention-grabbing

**Usage:**
```html
<!-- Automatically applied -->
<div class="login-container">...</div>
<div class="card">...</div>
<div class="message">...</div>
<div class="tool-wrapper">...</div>

<!-- Manual application -->
<div class="animate-entrance">Custom Element</div>

<!-- Staggered list entrance -->
<div class="animate-entrance-stagger">
  <div>Item 1</div> <!-- Delay: 0ms -->
  <div>Item 2</div> <!-- Delay: 50ms -->
  <div>Item 3</div> <!-- Delay: 100ms -->
  <div>Item 4</div> <!-- Delay: 150ms -->
  <div>Item 5</div> <!-- Delay: 200ms -->
  <div>Item 6</div> <!-- Delay: 250ms -->
</div>
```

**Animation Keyframes:**
```css
0%   { opacity: 0; transform: scale(0.8); }
100% { opacity: 1; transform: scale(1); }
```

---

### 3. Loading Animations

**Name:** Spinner
**Duration:** 800ms
**Easing:** linear
**Effect:** Classic rotating spinner - universal loading state

**Usage:**
```html
<!-- Automatically applied -->
<div class="loading-spinner"></div>

<!-- Manual application -->
<div class="animate-spinner">Loading...</div>

<!-- Alternative pulse loading -->
<div class="animate-pulse">Loading...</div>

<!-- Skeleton loader with shimmer -->
<div class="skeleton-loader" style="height: 20px; border-radius: 4px;"></div>
```

**Animation Types:**
1. **Spinner:** 360° rotation
2. **Pulse:** Opacity fade in/out (2s cycle)
3. **Shimmer:** Gradient sweep for skeleton screens

---

### 4. Feedback Animations

**Name:** Ripple Effect
**Duration:** 600ms
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)
**Effect:** Material ripple - click feedback on buttons/cards

**Usage:**
```html
<!-- Ripple effect on click -->
<button class="btn animate-ripple">Click for Ripple</button>
<div class="tool-card animate-ripple">Card with ripple</div>

<!-- Error shake -->
<input class="form-input animate-shake" />

<!-- Success bounce -->
<div class="message success animate-success">Saved!</div>
```

**Animation Types:**
1. **Ripple:** Expands from click point, fades out
2. **Shake:** Horizontal shake for errors (0.5s)
3. **Success Bounce:** Vertical bounce for confirmations (0.6s)

---

### 5. Page Transition Animations

**Name:** Fade Cross
**Duration:** 300ms
**Easing:** ease-in-out
**Effect:** Simple cross-fade - minimal, professional

**Usage:**
```javascript
// Exit current page
currentPage.classList.add('page-exit');

setTimeout(() => {
  // Remove old page, show new page
  newPage.classList.add('page-enter');
}, 300);
```

```html
<!-- Slide transitions -->
<div class="slide-in-right">Slides from right</div>
<div class="slide-in-left">Slides from left</div>
```

**Animation Types:**
1. **Fade Out:** opacity 1 → 0
2. **Fade In:** opacity 0 → 1
3. **Slide Right:** From right with fade
4. **Slide Left:** From left with fade

---

### 6. Micro-interaction Animations

**Name:** Toggle Slide
**Duration:** 200ms
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)
**Effect:** Smooth toggle switch - settings, preferences

**Usage:**
```html
<!-- Toggle Switch -->
<label class="toggle-switch">
  <input type="checkbox" />
  <span class="toggle-slider"></span>
</label>

<!-- Animated Checkbox -->
<label class="checkbox-animated">
  <input type="checkbox" />
  <span class="checkbox-checkmark"></span>
  I agree to terms
</label>

<!-- Focus Ring -->
<input class="form-input focus-ring" />
```

**Components:**
1. **Toggle Switch:** 24px slide with color change
2. **Checkbox:** Pop animation with checkmark draw
3. **Focus Ring:** 3px glow on focus

---

## Utility Classes

### Delay Utilities
```html
<div class="animate-entrance delay-0">No delay</div>
<div class="animate-entrance delay-50">50ms delay</div>
<div class="animate-entrance delay-100">100ms delay</div>
<div class="animate-entrance delay-150">150ms delay</div>
<div class="animate-entrance delay-200">200ms delay</div>
<div class="animate-entrance delay-300">300ms delay</div>
```

### Duration Utilities
```html
<div class="animate-entrance duration-fast">Fast (200ms)</div>
<div class="animate-entrance duration-normal">Normal (250ms)</div>
<div class="animate-entrance duration-medium">Medium (300ms)</div>
```

### Hover Utilities
```html
<!-- Simple lift on hover -->
<div class="hover-lift">Lifts -3px</div>

<!-- Scale on hover -->
<div class="hover-scale">Scales 1.05x</div>

<!-- Glow on hover -->
<div class="hover-glow">Glows with brand color</div>
```

---

## Accessibility

### Reduced Motion Support

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**What this means:**
- Users with motion sensitivity will see instant transitions
- Accessibility settings are automatically respected
- No code changes needed - works system-wide

---

## Performance Best Practices

### Hardware-Accelerated Properties

All animations use GPU-accelerated properties:
- `transform` (translateX, translateY, scale, rotate)
- `opacity`

**Avoid animating:**
- `width`, `height` (triggers layout)
- `margin`, `padding` (triggers layout)
- `top`, `left`, `right`, `bottom` (triggers layout)

### Will-Change Optimization

Key interactive elements use `will-change` hints:
```css
.animate-hover {
  will-change: transform;
}
```

**Important:** Only use on elements that will animate frequently (buttons, cards).

---

## Integration Examples

### 1. Custom Button with Ripple

```html
<button class="btn btn-primary animate-ripple">
  Save Changes
</button>
```

### 2. Staggered Card Grid

```html
<div class="animate-entrance-stagger">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

### 3. Form with Feedback

```html
<form id="myForm">
  <input type="text" class="form-input focus-ring" />
  <button type="submit" class="btn-primary animate-ripple">
    <span class="button-text">Submit</span>
    <span class="loading-spinner" style="display: none;"></span>
  </button>
  <div class="message success animate-success" style="display: none;">
    Form submitted successfully!
  </div>
</form>

<script>
document.getElementById('myForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const text = btn.querySelector('.button-text');
  const spinner = btn.querySelector('.loading-spinner');

  // Show loading
  text.style.display = 'none';
  spinner.style.display = 'inline-block';

  // Simulate API call
  setTimeout(() => {
    // Hide loading
    text.style.display = 'inline';
    spinner.style.display = 'none';

    // Show success message
    const message = e.target.querySelector('.message');
    message.style.display = 'block';
  }, 2000);
});
</script>
```

### 4. Toggle Setting

```html
<div class="form-group" style="display: flex; align-items: center; gap: 10px;">
  <label class="toggle-switch">
    <input type="checkbox" id="notifications" />
    <span class="toggle-slider"></span>
  </label>
  <label for="notifications">Enable notifications</label>
</div>
```

### 5. Page Transition

```html
<script>
function navigateToPage(pageName) {
  const currentPage = document.querySelector('.page-content');

  // Exit animation
  currentPage.classList.add('page-exit');

  setTimeout(() => {
    // Load new content
    loadPageContent(pageName);

    // Enter animation
    const newPage = document.querySelector('.page-content');
    newPage.classList.add('page-enter');
  }, 300);
}
</script>
```

---

## Custom Animation Development

### Creating New Animations

When adding custom animations:

1. **Define keyframes:**
```css
@keyframes customAnimation {
  0% { /* start state */ }
  100% { /* end state */ }
}
```

2. **Use animation tokens:**
```css
.custom-element {
  animation: customAnimation var(--duration-normal) var(--ease-standard);
}
```

3. **Add accessibility support:**
```css
@media (prefers-reduced-motion: reduce) {
  .custom-element {
    animation: none;
  }
}
```

4. **Use hardware-accelerated properties:**
- ✅ `transform`, `opacity`
- ❌ `width`, `height`, `margin`, `padding`

---

## Testing Checklist

When implementing animations:

- [ ] Animation runs at 60fps on target devices
- [ ] Respects `prefers-reduced-motion` setting
- [ ] Uses hardware-accelerated properties only
- [ ] Duration is appropriate (100-600ms for most interactions)
- [ ] Easing feels natural
- [ ] Works consistently across browsers
- [ ] Disabled state prevents animations
- [ ] Loading states are clear
- [ ] Touch interactions feel responsive

---

## Browser Support

All animations tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

**Fallbacks:**
- Legacy browsers will see instant transitions
- All functionality works without animations

---

## Maintenance

### Updating Animation Tokens

Edit the `:root` section in `/shared/styles.html`:

```css
:root {
  /* Update these values to change animations globally */
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Adding New Animation Classes

1. Add to appropriate section in `/shared/styles.html`
2. Document in this file
3. Test with reduced motion
4. Update examples

---

## Quick Reference

| Animation Type | Class | Duration | Usage |
|---------------|-------|----------|-------|
| Button Hover | `.animate-hover` | 250ms | Modern lift + scale |
| Entrance | `.animate-entrance` | 350ms | Zoom in with bounce |
| Loading Spinner | `.loading-spinner` | 800ms | Infinite rotation |
| Ripple Effect | `.animate-ripple` | 600ms | Click feedback |
| Page Fade | `.page-enter/.page-exit` | 300ms | Cross-fade transition |
| Toggle Switch | `.toggle-switch` | 200ms | Smooth slide |
| Shake Error | `.animate-shake` | 500ms | Error feedback |
| Success Bounce | `.animate-success` | 600ms | Success feedback |
| Pulse Loading | `.animate-pulse` | 2s | Alternative loading |

---

## Support

For questions or issues with the animation system, contact the development team or refer to:
- Design system documentation
- Component library examples
- Browser DevTools Performance panel for debugging

---

*Last Updated: November 3, 2024*
*Animation System Version: 1.0*
*Financial TruPath v3*
