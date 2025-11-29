#!/bin/bash
# Check for forbidden GAS navigation patterns before deployment

echo "🔍 Checking for forbidden navigation patterns..."
echo ""

FOUND=0

# Check for window.location.reload
if grep -rn "window.location.reload\|location.reload" tools/ 2>/dev/null; then
  echo "❌ FOUND: window.location.reload()"
  echo "   Replace with document.write() pattern"
  echo "   See: docs/Navigation/GAS-NAVIGATION-RULES.md"
  FOUND=1
fi

# Check for window.location.href =
if grep -rn "window.location.href\s*=" tools/ 2>/dev/null; then
  echo "❌ FOUND: window.location.href ="
  echo "   Replace with document.write() pattern"
  echo "   See: docs/Navigation/GAS-NAVIGATION-RULES.md"
  FOUND=1
fi

# Check for location.href =
if grep -rn "location.href\s*=" tools/ 2>/dev/null; then
  echo "❌ FOUND: location.href ="
  echo "   Replace with document.write() pattern"
  echo "   See: docs/Navigation/GAS-NAVIGATION-RULES.md"
  FOUND=1
fi

echo ""
if [ $FOUND -eq 0 ]; then
  echo "✅ No forbidden patterns found - safe to deploy!"
  exit 0
else
  echo "⚠️  Fix forbidden patterns before deploying"
  echo ""
  echo "Correct pattern:"
  echo "  google.script.run"
  echo "    .withSuccessHandler(function(result) {"
  echo "      document.open();"
  echo "      document.write(result.nextPageHtml);"
  echo "      document.close();"
  echo "      window.scrollTo(0, 0);"
  echo "    })"
  echo ""
  exit 1
fi
