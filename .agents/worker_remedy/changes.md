# Changes Summary

This document describes the changes applied to the EAE Materials portfolio website.

## 1. Style Changes (`style.css`)
- **Location**: Line 2621-2623 (formerly line 2622)
- **Change**: Changed `.goals-layout` alignment rule `align-items: stretch;` to `align-items: start;`.
- **Rationale**: Prevent elements inside the goals layout from stretching vertically, allowing them to naturally size themselves at the start of their grid tracks.

```css
.goals-layout {
  align-items: start;
}
```

## 2. HTML Markup Changes (`index.html`)
- **Location**: Line 87 (formerly line 85)
- **Change**: Removed `role="tabpanel"` and `aria-labelledby="view-cards"` from the `<main>` element.
- **Rationale**: Removes the role conflict where `<main>` landmark's semantic meaning was overridden by the ARIA `tabpanel` role, resolving ARIA and landmark accessibility issues.

```html
    <main id="main">
```

- **Location**: Line 66-82 (wrapped inside a `<nav>` element)
- **Change**: Wrapped the `.view-mode-bar` `<div>` in a `<nav aria-label="View mode selection">` block.
- **Rationale**: Resolves the axe-core landmark region check failure where visible page content was located outside of any landmark region. Since the view mode bar has `role="tablist"` it cannot itself be a landmark, so wrapping it in a `<nav>` element provides a valid navigational landmark wrapper.

```html
    <nav aria-label="View mode selection">
      <div class="view-mode-bar" role="tablist" aria-label="Portfolio view mode">
        ...
      </div>
    </nav>
```
