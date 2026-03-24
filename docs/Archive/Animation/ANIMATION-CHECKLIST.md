# Animation Implementation Checklist

Quick checklist for developers implementing animations in Financial TruPath v3.

---

## Before You Start

- [ ] Read `/docs/ANIMATION-SYSTEM.md` (5 min overview)
- [ ] Review `/docs/ANIMATION-QUICK-REFERENCE.md` (class names)
- [ ] Open `/examples/animation-demo.html` (live examples)

---

## Implementing Animations

### Buttons

**Standard buttons automatically animate** - no work needed!

```html
<!-- These work out of the box -->
<button class="btn">Button</button>
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
```

**Add ripple effect:**
```html
<button class="btn-primary animate-ripple">Click Me</button>
```

**Add loading state:**
```html
<button class="btn-primary" id="myBtn">
  <span class="btn-text">Submit</span>
  <span class="loading-spinner" style="display: none;"></span>
</button>
```

- [ ] All buttons use `.btn`, `.btn-primary`, or `.btn-secondary`
- [ ] Loading spinners hidden by default
- [ ] Ripple effect added to primary actions

---

### Cards & Containers

**Cards automatically animate on entrance:**

```html
<div class="card">
  <!-- Content here -->
</div>
```

**For custom hover effects:**
```html
<div class="card hover-lift">Lifts on hover</div>
<div class="card hover-scale">Scales on hover</div>
<div class="card hover-glow">Glows on hover</div>
```

- [ ] Use `.card` class for consistent entrance
- [ ] Apply hover utilities for interactive cards
- [ ] Tool cards use `.tool-card` class

---

### Lists & Grids

**Staggered entrance for lists:**

```html
<div class="animate-entrance-stagger">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>
```

**Manual delays:**
```html
<div class="card delay-0">Immediate</div>
<div class="card delay-100">100ms delay</div>
<div class="card delay-200">200ms delay</div>
```

- [ ] Use `.animate-entrance-stagger` for list animations
- [ ] Keep list length reasonable (6 items max for auto-stagger)
- [ ] Use manual delays for custom timing

---

### Forms

**Focus rings on inputs:**
```html
<input type="text" class="form-input focus-ring" />
<select class="form-select focus-ring"></select>
<textarea class="focus-ring"></textarea>
```

**Error validation:**
```html
<input type="email" class="form-input" id="email" />

<script>
function validateEmail() {
  const input = document.getElementById('email');
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

**Success feedback:**
```html
<div class="message success animate-success" style="display: none;">
  Saved successfully!
</div>
```

- [ ] Add `.focus-ring` to all form inputs
- [ ] Use `.animate-shake` for validation errors
- [ ] Use `.animate-success` for confirmation messages
- [ ] Clear validation states on input

---

### Loading States

**Spinner:**
```html
<div class="loading-spinner"></div>
```

**Pulse:**
```html
<div class="animate-pulse">Loading...</div>
```

**Skeleton:**
```html
<div class="skeleton-loader" style="height: 20px; border-radius: 4px;"></div>
```

**Button loading:**
```javascript
function showLoading(button) {
  button.disabled = true;
  button.querySelector('.btn-text').style.display = 'none';
  button.querySelector('.loading-spinner').style.display = 'inline-block';
}

function hideLoading(button) {
  button.disabled = false;
  button.querySelector('.btn-text').style.display = 'inline';
  button.querySelector('.loading-spinner').style.display = 'none';
}
```

- [ ] Always disable buttons during loading
- [ ] Show loading state for operations > 500ms
- [ ] Use appropriate loading type (spinner/pulse/skeleton)
- [ ] Clear loading state on completion or error

---

### Messages & Notifications

**Auto-animated messages:**
```html
<div class="message success">Success message</div>
<div class="message error">Error message</div>
<div class="message warning">Warning message</div>
<div class="message info">Info message</div>
```

**Dismissable with transition:**
```javascript
function dismissMessage(messageId) {
  const msg = document.getElementById(messageId);
  msg.classList.add('page-exit');
  setTimeout(() => msg.style.display = 'none', 300);
}
```

- [ ] Use correct message class (success/error/warning/info)
- [ ] Add exit animation before removing
- [ ] Auto-dismiss after 5 seconds (optional)

---

### Page Transitions

**Simple fade:**
```javascript
function changePage(newContent) {
  const container = document.querySelector('.page-content');

  // Exit
  container.classList.add('page-exit');

  setTimeout(() => {
    // Update content
    container.innerHTML = newContent;

    // Enter
    container.classList.remove('page-exit');
    container.classList.add('page-enter');

    setTimeout(() => {
      container.classList.remove('page-enter');
    }, 300);
  }, 300);
}
```

**Slide transition:**
```html
<div class="slide-in-right">New content from right</div>
<div class="slide-in-left">New content from left</div>
```

- [ ] Wait for exit animation before changing content
- [ ] Remove transition classes after animation completes
- [ ] Keep transitions under 300ms

---

### Micro-interactions

**Toggle switch:**
```html
<label class="toggle-switch">
  <input type="checkbox" id="toggle1" onchange="handleToggle(this)" />
  <span class="toggle-slider"></span>
</label>
<label for="toggle1">Setting name</label>
```

**Animated checkbox:**
```html
<label class="checkbox-animated">
  <input type="checkbox" id="check1" />
  <span class="checkbox-checkmark"></span>
  <span>Checkbox label</span>
</label>
```

- [ ] Use `.toggle-switch` for on/off settings
- [ ] Use `.checkbox-animated` for selections
- [ ] Always include accessible labels
- [ ] Handle change events for functionality

---

## Accessibility Checklist

- [ ] Test with "Reduce Motion" enabled in OS
- [ ] Verify animations become instant (not disabled)
- [ ] Test keyboard navigation
- [ ] Check focus indicators are visible
- [ ] Test with screen reader
- [ ] Ensure disabled states work correctly

**Testing Reduce Motion:**
- macOS: System Preferences → Accessibility → Display → Reduce motion
- Chrome DevTools: CMD+Shift+P → "Render" → Emulate prefers-reduced-motion

---

## Performance Checklist

- [ ] Only animate `transform` and `opacity`
- [ ] Avoid animating `width`, `height`, `margin`, `padding`
- [ ] Keep animations under 600ms (except loading)
- [ ] Don't overuse `will-change`
- [ ] Test on lower-end devices
- [ ] Check frame rate in DevTools Performance panel

**Red Flags:**
- ❌ Layout shifts during animation
- ❌ Animations causing reflows
- ❌ Frame rate dropping below 60fps
- ❌ Jank or stuttering

---

## Common Patterns

### Save Button Pattern
```html
<button class="btn-primary animate-ripple" onclick="saveData(this)">
  <span class="btn-text">Save Changes</span>
  <span class="loading-spinner" style="display: none;"></span>
</button>

<script>
async function saveData(button) {
  // Show loading
  button.disabled = true;
  button.querySelector('.btn-text').style.display = 'none';
  button.querySelector('.loading-spinner').style.display = 'inline-block';

  try {
    // API call
    await yourApiCall();

    // Hide loading
    button.querySelector('.btn-text').style.display = 'inline';
    button.querySelector('.loading-spinner').style.display = 'none';
    button.disabled = false;

    // Show success
    showSuccessMessage('Changes saved!');
  } catch (error) {
    // Hide loading
    button.querySelector('.btn-text').style.display = 'inline';
    button.querySelector('.loading-spinner').style.display = 'none';
    button.disabled = false;

    // Show error
    showErrorMessage('Failed to save changes');
  }
}
</script>
```

### Form Validation Pattern
```javascript
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('.form-input');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      input.classList.add('animate-shake');
      setTimeout(() => input.classList.remove('animate-shake'), 500);
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });

  return isValid;
}
```

### Success Message Pattern
```javascript
function showSuccessMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message success animate-success';
  msg.textContent = text;
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.classList.add('page-exit');
    setTimeout(() => msg.remove(), 300);
  }, 3000);
}
```

---

## Quick Reference

| Need | Use |
|------|-----|
| Button hover | Auto-applied |
| Card entrance | `.card` |
| List animation | `.animate-entrance-stagger` |
| Loading spinner | `.loading-spinner` |
| Button ripple | `.animate-ripple` |
| Error shake | `.animate-shake` |
| Success bounce | `.animate-success` |
| Page fade | `.page-exit` / `.page-enter` |
| Toggle switch | `.toggle-switch` |
| Focus ring | `.focus-ring` |
| Hover lift | `.hover-lift` |
| Hover scale | `.hover-scale` |
| Hover glow | `.hover-glow` |

---

## Resources

- **Full Documentation:** `/docs/ANIMATION-SYSTEM.md`
- **Quick Reference:** `/docs/ANIMATION-QUICK-REFERENCE.md`
- **Interactive Demo:** `/examples/animation-demo.html`
- **Implementation Summary:** `/ANIMATION-IMPLEMENTATION-SUMMARY.md`

---

## Questions?

Common issues and solutions:

**Animation not working?**
- Check class name spelling
- Verify element is visible (not `display: none`)
- Check for CSS conflicts
- Test without `prefers-reduced-motion`

**Animation too fast/slow?**
- Add duration utility: `.duration-fast`, `.duration-normal`, `.duration-medium`
- Or use custom CSS with animation tokens

**Animation not smooth?**
- Verify you're only animating `transform` and `opacity`
- Check DevTools Performance panel
- Test on target device

**Accessibility concerns?**
- Always test with reduced motion enabled
- Ensure functionality works without animations
- Check focus indicators are visible

---

*Last Updated: November 3, 2024*
*Animation System v1.0*
