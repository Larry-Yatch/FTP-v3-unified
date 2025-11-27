# Template Literal Guidelines for Google Apps Script

## Critical Rules

### 1. Choose ONE HTML Generation Pattern

**Option A: JavaScript Template Literals (Tool 4 pattern)**
```javascript
buildPage() {
  const html = `<!DOCTYPE html><html>...`;
  return HtmlService.createHtmlOutput(html);  // NOT createTemplate()
}
```

**Option B: Apps Script Templates (Tools 1/2/3/5 pattern)**
```javascript
render() {
  const template = HtmlService.createTemplateFromFile('template.html');
  template.data = someData;
  return template.evaluate();
}
```

**NEVER mix these approaches!**

### 2. Embedding Data in Template Literals

**❌ NEVER do this:**
```javascript
const html = `
  <script>
    const data = ${JSON.stringify(userData)};  // BREAKS if userData has quotes!
  </script>
`;
```

**✅ ALWAYS use base64 for user data:**
```javascript
const dataBase64 = Utilities.base64Encode(JSON.stringify(userData));
const html = `
  <script>
    const data = JSON.parse(atob('${dataBase64}'));
  </script>
`;
```

### 3. Quote Escaping in Nested Contexts

**❌ WRONG:**
```javascript
const html = `
  <script>
    const handler = 'onclick="myFunc(\'' + id + '\')"';  // Escaped quotes break!
  </script>
`;
```

**✅ CORRECT:**
```javascript
const html = `
  <script>
    const handler = "onclick=\\"myFunc('" + id + "')\\";  // Use different quotes
  </script>
`;
```

### 4. Embedding External HTML

**❌ RISKY:**
```javascript
const external = HtmlService.createHtmlOutputFromFile('file').getContent();
const html = `<div>${external}</div>`;  // What if 'external' has backticks or ${} ?
```

**✅ SAFER:**
- Only embed trusted, controlled HTML snippets
- Never embed files that contain script tags with complex JavaScript
- Test that embedded content doesn't contain: backticks, `${}`, `document.write()`

### 5. When Tool Renders Work but Suddenly Break

**If a tool worked in Phase 1 but breaks in Phase 2:**
1. Check what data changed (empty data → user data with special chars)
2. Look for `JSON.stringify()` directly in template literals
3. Search for escaped quotes: `grep -n "\\\\'" yourfile.js`
4. Check if using both `createTemplate()` AND template literals

## Testing Checklist

Before deploying tools that use template literals:

- [ ] Verified using `createHtmlOutput()` not `createTemplate()`
- [ ] All user data uses base64 encoding
- [ ] Searched for `\'` in template literal context
- [ ] No `document.write()` in embedded HTML
- [ ] Tested with user data containing: `'`, `"`, `\`, backticks

## Quick Fix Reference

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Failed to execute 'write'` | Template literal syntax error | Check for `\'`, backticks, `${}` in strings |
| `ReferenceError: function is not defined` | Script never executed due to syntax error | Fix the syntax error first |
| Works in Phase 1, breaks in Phase 2 | User data now contains special chars | Use base64 encoding |
| White screen, no errors | `createTemplate()` on template literal | Use `createHtmlOutput()` |

## Related Files

- Working example: `/tools/tool4/Tool4.js` (after fix)
- Bug history: `/docs/Tool4/BUG-WEEK2-DEPLOYMENT-ISSUE.md`
