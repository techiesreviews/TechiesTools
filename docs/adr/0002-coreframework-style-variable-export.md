---
status: superseded by ADR-0009
---

# CoreFramework Style Variable Export

Framework export starts with CoreFramework-style CSS: `html` setup, light/dark theme selectors, and variables before component rules. We chose this format over a generic `--color-*` token dump because the expected output needs to be portable into CoreFramework conventions. The current implementation deliberately starts with the primary color only, generating `--primary`, `--primary-l-*`, and `--primary-d-*` before expanding to type, space, component, and utility output.
