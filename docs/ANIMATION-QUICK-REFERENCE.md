# Animation System - Quick Reference Guide

## CSS Animation Tokens

### Durations
```css
var(--duration-instant)    /* 100ms */
var(--duration-fast)       /* 200ms */
var(--duration-normal)     /* 250ms */
var(--duration-medium)     /* 300ms */
var(--duration-entrance)   /* 350ms */
var(--duration-feedback)   /* 600ms */
var(--duration-loading)    /* 800ms */
```

### Easing Functions
```css
var(--ease-standard)  /* cubic-bezier(0.4, 0, 0.2, 1) */
var(--ease-bounce)    /* cubic-bezier(0.34, 1.56, 0.64, 1) */
var(--ease-smooth)    /* ease-in-out */
var(--ease-linear)    /* linear */
```

### Shadows
```css
var(--shadow-hover)     /* 0 4px 12px rgba(0,0,0,0.15) */
var(--shadow-active)    /* 0 2px 8px rgba(0,0,0,0.1) */
var(--shadow-elevated)  /* 0 6px 20px rgba(173, 145, 104, 0.2) */
```

---

## Common Classes

### Auto-Applied (No class needed)
- `.btn`, `.btn-primary`, `.btn-secondary` → Hover animations
- `.tool-card` → Hover animations
- `.login-container` → Entrance animation
- `.card` → Entrance animation
- `.message` → Entrance animation
- `.loading-spinner` → Rotation animation

### Manual Application

**Hover Effects:**
```html
<div class="animate-hover">Lifts and scales on hover</div>
<div class="hover-lift">Lifts -3px</div>
<div class="hover-scale">Scales 1.05x</div>
<div class="hover-glow">Glows on hover</div>
```

**Entrance:**
```html
<div class="animate-entrance">Zooms in with bounce</div>
<div class="animate-entrance-stagger">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Loading:**
```html
<div class="animate-spinner">Rotates infinitely</div>
<div class="animate-pulse">Pulses opacity</div>
<div class="skeleton-loader">Shimmer effect</div>
```

**Feedback:**
```html
<button class="animate-ripple">Ripple on click</button>
<div class="animate-shake">Shakes for errors</div>
<div class="animate-success">Bounces for success</div>
```

**Transitions:**
```html
<div class="page-exit">Fades out</div>
<div class="page-enter">Fades in</div>
<div class="slide-in-right">Slides from right</div>
<div class="slide-in-left">Slides from left</div>
```

**Micro-interactions:**
```html
<label class="toggle-switch">
  <input type="checkbox" />
  <span class="toggle-slider"></span>
</label>

<label class="checkbox-animated">
  <input type="checkbox" />
  <span class="checkbox-checkmark"></span>
</label>

<input class="focus-ring" />
```

---

## Utility Classes

**Delays:**
```html
<div class="delay-0">0ms</div>
<div class="delay-50">50ms</div>
<div class="delay-100">100ms</div>
<div class="delay-150">150ms</div>
<div class="delay-200">200ms</div>
<div class="delay-300">300ms</div>
```

**Durations:**
```html
<div class="duration-fast">200ms</div>
<div class="duration-normal">250ms</div>
<div class="duration-medium">300ms</div>
```

---

## Copy-Paste Examples

### Button with Loading State
```html
<button class="btn-primary animate-ripple" id="submitBtn">
  <span class="btn-text">Submit</span>
  <span class="loading-spinner" style="display: none;"></span>
</button>

<script>
document.getElementById('submitBtn').addEventListener('click', function() {
  this.disabled = true;
  this.querySelector('.btn-text').style.display = 'none';
  this.querySelector('.loading-spinner').style.display = 'inline-block';

  // Simulate API call
  setTimeout(() => {
    this.disabled = false;
    this.querySelector('.btn-text').style.display = 'inline';
    this.querySelector('.loading-spinner').style.display = 'none';
  }, 2000);
});
</script>
```

### Success Message
```html
<div class="message success animate-success" style="display: none;" id="successMsg">
  Changes saved successfully!
</div>

<script>
function showSuccess() {
  const msg = document.getElementById('successMsg');
  msg.style.display = 'block';
  setTimeout(() => {
    msg.classList.add('page-exit');
    setTimeout(() => msg.style.display = 'none', 300);
  }, 3000);
}
</script>
```

### Error Shake
```html
<input type="text" class="form-input" id="emailInput" />

<script>
function validateEmail() {
  const input = document.getElementById('emailInput');
  if (!input.value.includes('@')) {
    input.classList.add('animate-shake');
    input.classList.add('error');
    setTimeout(() => input.classList.remove('animate-shake'), 500);
    return false;
  }
  return true;
}
</script>
```

### Toggle with Callback
```html
<label class="toggle-switch">
  <input type="checkbox" id="notifToggle" onchange="handleToggle(this)" />
  <span class="toggle-slider"></span>
</label>

<script>
function handleToggle(checkbox) {
  console.log('Notifications:', checkbox.checked ? 'ON' : 'OFF');
  // Save preference...
}
</script>
```

### Staggered Cards
```html
<div class="animate-entrance-stagger">
  <div class="card hover-lift">Card 1</div>
  <div class="card hover-lift">Card 2</div>
  <div class="card hover-lift">Card 3</div>
</div>
```

---

## Performance Tips

✅ **DO:**
- Use `transform` and `opacity`
- Add `will-change: transform` to frequently animated elements
- Keep durations under 600ms for interactions
- Use `translate` instead of `top/left`

❌ **DON'T:**
- Animate `width`, `height`, `margin`, `padding`
- Overuse `will-change` (only on elements that animate often)
- Create animations longer than 1s for interactions
- Forget to test with `prefers-reduced-motion`

---

## Testing Motion Preferences

**Chrome DevTools:**
1. Open DevTools (F12)
2. CMD+Shift+P → "Render"
3. Check "Emulate CSS media feature prefers-reduced-motion"

**Firefox:**
1. Open DevTools (F12)
2. Settings → "Emulate prefers-reduced-motion"

**macOS System:**
1. System Preferences → Accessibility
2. Display → Reduce motion

---

## Cheat Sheet

| Need | Use |
|------|-----|
| Button hover | Auto-applied to `.btn` |
| Card hover | Auto-applied to `.tool-card` |
| Element entrance | `.animate-entrance` |
| List entrance | `.animate-entrance-stagger` on parent |
| Loading spinner | `.loading-spinner` |
| Click feedback | `.animate-ripple` |
| Error feedback | `.animate-shake` |
| Success feedback | `.animate-success` |
| Page transition | `.page-exit` → `.page-enter` |
| Toggle switch | `.toggle-switch` structure |
| Checkbox | `.checkbox-animated` structure |
| Focus ring | `.focus-ring` |
| Delayed start | `.delay-{0-300}` |
| Custom hover | `.hover-lift`, `.hover-scale`, `.hover-glow` |

---

*Financial TruPath v3 Animation System*
