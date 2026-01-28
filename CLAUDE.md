# Development Guidelines

## 🎯 Project Context

**Active Project:** Financial-TruPath-v3 (this directory)
- Current development, modular architecture
- Plugin-based tool system
- Configuration-driven insights

**Reference Only:** FTP-v2 (`/Users/Larry/code/FTP-v2`)
- Legacy system for reference
- Do NOT make changes to v2
- Use v2 code patterns as examples only

## Core Principles

### Code Quality
- Write clean, maintainable code following project conventions
- Prefer existing patterns over introducing new ones
- Check similar components before building new features
- Test changes before marking tasks complete

### File Organization
- Read relevant source files before making changes
- Understand existing architecture before adding features
- Keep related code together
- Use consistent naming conventions

### Project Context & Dependencies

**Before building features:**
1. Find and read project manifest (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, etc.)
2. Check available dependencies, scripts, and tools
3. Ask permission before adding new dependencies
4. Prefer using existing dependencies over adding new ones

### Styling Architecture (if applicable)

**Core Rule: Utility-First + Design Tokens**
- ✅ Use Tailwind utilities for layout, spacing, sizing, responsive design
- ✅ Use CSS variables from `globals.css` for colors, fonts, shadows, animations
- ❌ NO inline `style={{ }}` for static properties
- ⚠️ ONLY inline styles for dynamic values (e.g., `style={{ animationDelay: '${delay}ms' }}`)

**Reference Files:**
- Design tokens: `globals.css`, `tailwind.config.js`
- Component patterns: Check existing components in same category

**Component Building Process:**
1. **FIRST**: Check if design system files exist (`globals.css`, `tailwind.config.js`)
   - If missing, inform user: "Design system not configured yet. Would you like me to set up a basic design system?"
2. Read design token files to see available variables
3. Check existing components for established patterns
4. Use utility classes for structure/layout
5. Use design token classes for visual identity

### Validation After Changes

**After creating or editing files:**
1. Check project manifest (`package.json`, etc.) for validation scripts
2. Run available type checking, linting, or build commands
3. Fix any errors immediately
4. Only mark task complete when validation passes
5. If no validation tools exist, suggest adding them

### Before Committing
- Run tests if they exist
- Verify all type checks and linting pass
- Check for console errors
- Verify functionality matches requirements
- **CRITICAL FOR GAS PROJECTS:** Check for forbidden navigation patterns:
  ```bash
  grep -rn "window.location.reload\|location.reload" tools/
  ```
  If found, replace with `document.write()` pattern per `docs/Navigation/GAS-NAVIGATION-RULES.md`
- Use `/commit` command for clear git messages

## 🚨 Google Apps Script Navigation Rules

**NEVER use `window.location.reload()` or `window.location.href` after user interaction.**

**ALWAYS use this pattern:**
```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (result && result.nextPageHtml) {
      document.open();
      document.write(result.nextPageHtml);
      document.close();
      window.scrollTo(0, 0);
    }
  })
  .serverFunction(params);
```

**Reference:** `docs/Navigation/GAS-NAVIGATION-RULES.md`

**Before writing ANY navigation code:**
1. Read `docs/Navigation/GAS-NAVIGATION-RULES.md` FIRST
2. Copy from `core/FormUtils.js` or working examples
3. DO NOT write navigation from memory
4. When debugging "X works but Y doesn't", immediately diff the two implementations

---

## 🚨 JavaScript in Template Literals (GAS Projects)

**CRITICAL:** When writing JavaScript code inside template literals (especially for GAS tools that use `document.write()`):

### ❌ AVOID:
- Escaped apostrophes in strings: `'you\'re'`, `'don\'t'`, `'can\'t'`
- Contractions with apostrophes in user-facing messages
- Nested template literals in generated JavaScript
- Complex string concatenation with mixed quotes

### ✅ USE INSTEAD:
- Full words: `'you are'`, `'do not'`, `'cannot'`
- Double quotes for outer strings if apostrophes needed internally: `"user's choice"`
- String concatenation with `+` operator for clarity
- Consistent quote style throughout a function

### Why This Matters:
Google Apps Script's `document.write()` pattern causes **double-escaping issues** when JavaScript code is:
1. Written inside server-side template literals (backticks)
2. Returned as HTML strings
3. Injected via `document.write()`

The escaping gets mangled: `'you\'re'` becomes invalid JavaScript and causes syntax errors like `Unexpected identifier 're'`.

### Pre-Deployment Check:
```bash
# Search for potentially problematic escaped apostrophes in message strings
grep -n "\\\\'.*message:" tools/*/Tool*.js
```

If found, replace contractions with full words or use double quotes.

### Example:
```javascript
// ❌ BAD - Will cause syntax error in GAS
message: 'You\'re at ' + value + '%. Don\'t exceed 50%.'

// ✅ GOOD - Works reliably
message: 'You are at ' + value + '%. Do not exceed 50%.'

// ✅ ALSO GOOD - Double quotes protect apostrophes
message: "You're at " + value + "%. Don't exceed 50%."
```

**Golden Rule:** If the JavaScript code lives inside backticks (\`\`) and will be output to HTML, treat apostrophes like SQL injection vulnerabilities - sanitize or avoid them entirely.

---

## 🚨 Tool 6 Slider CSS - NEVER REMOVE

**CRITICAL:** The vehicle sliders in Tool 6 require specific CSS for the thumb to be draggable. This has been broken and fixed 5+ times.

### Required CSS (in Tool6.js around line 5188):

```css
/* These MUST exist or sliders will not be draggable */
.vehicle-slider::-webkit-slider-runnable-track { ... }
.vehicle-slider::-moz-range-track { ... }
.vehicle-slider::-webkit-slider-thumb { margin-top: -7px; ... }
```

### Why This Breaks:

When using `appearance: none` on range inputs, browsers require **explicit track styling** (`::-webkit-slider-runnable-track` and `::-moz-range-track`). Without these rules, the slider thumb cannot be grabbed and dragged - users can only click on the track.

### Before Refactoring Tool 6 Slider CSS:

1. Look for the comment block: `CRITICAL: SLIDER DRAG FUNCTIONALITY`
2. **DO NOT** remove or reorganize the track/thumb CSS rules
3. **DO NOT** remove `margin-top: -7px` from the thumb (centers it on track)
4. Test that sliders can be dragged (not just clicked) after any CSS changes

### Pre-Commit Check:

```bash
# Verify critical slider CSS exists
grep -n "webkit-slider-runnable-track\|moz-range-track" tools/tool6/Tool6.js
```

If this returns no results, the slider drag fix has been accidentally removed.
