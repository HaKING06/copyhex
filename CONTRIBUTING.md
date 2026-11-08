# Contributing

Thank you for improving CopyHex. Keep changes accessible, dependency-light and usable in both English and Turkish.

1. Describe the issue or proposed change clearly. For UI bugs, include browser, viewport and reproduction steps.
2. Make a focused change. Update `js/i18n.js` and editorial translations when changing user-facing text.
3. Preserve compatibility with the existing `copyhex-v1` local data and version-1 JSON backups.
4. For catalog changes, preserve provenance and the upstream MIT notice. Run `npm run catalog` and verify distinct HEX values.
5. Run `npm test` and `npm run build`. Check affected flows on mobile and desktop in both themes.
6. For PWA changes, test a controlled offline reload and a waiting-worker update. Do not silently delete saved palettes.

Use numeric color codes when a community name is not a CSS keyword. Avoid unlicensed datasets and unsupported claims about accessibility or search rankings.
