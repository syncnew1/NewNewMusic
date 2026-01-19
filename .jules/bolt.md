# Bolt's Journal

## 2024-05-22 - Redundant DOM Manipulation in ThemeContext
**Learning:** Found `toggleTheme` in `ThemeContext` manually toggling classList based on stale state. This was redundant because a `useEffect` hook was already handling the class updates based on state changes. Additionally, the Context value was not memoized, causing potential unnecessary re-renders for all consumers.
**Action:** Always check for manual DOM manipulations that duplicate `useEffect` logic. Ensure Context values are memoized with `useMemo` to prevent consumer re-renders.
