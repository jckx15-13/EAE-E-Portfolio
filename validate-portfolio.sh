#!/bin/bash

# Light validation script - checks HTML structure and key elements

echo "=== Portfolio Validation ==="
echo ""

echo "✓ Checking server connectivity..."
if curl -s http://localhost:3000 > /tmp/portfolio.html; then
  echo "  ✅ Server responding on port 3000"
else
  echo "  ❌ Server not responding"
  exit 1
fi

echo ""
echo "✓ Checking HTML structure..."
if grep -q '<main id="main">' /tmp/portfolio.html; then
  echo "  ✅ Main content area present"
else
  echo "  ❌ Main content area missing"
fi

if grep -q '<div class="view-mode-bar"' /tmp/portfolio.html; then
  echo "  ✅ View mode bar present"
else
  echo "  ❌ View mode bar missing"
fi

if grep -q 'id="projectsGrid"' /tmp/portfolio.html; then
  echo "  ✅ Projects grid present"
else
  echo "  ❌ Projects grid missing"
fi

echo ""
echo "✓ Checking for critical selectors..."
SELECTORS=("view-cards" "view-timeline" "view-story" "achievementCards" "applications")
for sel in "${SELECTORS[@]}"; do
  if grep -q "id=\"$sel\"" /tmp/portfolio.html; then
    echo "  ✅ #$sel found"
  else
    echo "  ⚠️  #$sel not found"
  fi
done

echo ""
echo "✓ Checking data.js load..."
if curl -s http://localhost:3000/data.js | grep -q "window.PORTFOLIO_DATA"; then
  echo "  ✅ data.js loaded"
else
  echo "  ❌ data.js failed to load"
fi

echo ""
echo "✓ Checking first project is SPD..."
if curl -s http://localhost:3000/data.js | grep -A3 '"projects"' | grep -q "SPD Caregiver"; then
  echo "  ✅ SPD project is first in order"
else
  echo "  ⚠️  SPD project order verification needed"
fi

echo ""
echo "✓ Checking images exist..."
IMAGES=("images/robots/fll-robot-design.png" "images/projects/SPD_User_Flow_Flow_chart.jpg" "images/projects/SPD_User_Flow_Flow_chart_Page_2.jpg" "images/projects/group_lobby.jpg")
for img in "${IMAGES[@]}"; do
  if [ -f "$img" ]; then
    echo "  ✅ $img exists"
  else
    echo "  ⚠️  $img missing"
  fi
done

echo ""
echo "✓ Checking CSS loads..."
if curl -s http://localhost:3000/style.css | grep -q "project-grid"; then
  echo "  ✅ style.css loaded"
else
  echo "  ❌ style.css failed"
fi

echo ""
echo "=== Validation Complete ==="
