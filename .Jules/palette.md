## 2025-10-26 - Accessible Range Inputs
**Learning:** This application relies heavily on `input[type="range"]` for player controls (progress, volume) but consistently omits labels. These are interactive elements that screen readers treat as sliders, and without `aria-label`, users have no context for what value they are adjusting.
**Action:** Always verify `input[type="range"]` elements have descriptive `aria-label` attributes, especially when visual labels are implicit (like icons).
