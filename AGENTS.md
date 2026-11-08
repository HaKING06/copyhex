# CopyHex project instructions

- For each completed project update, increment the application version in package.json. Use a patch increment by default; do not increment separately for every file edit or build.
- Update README.md and CHANGELOG.md for the release, then run npm run build so About pages in all languages, structured data, js/version.js and the service-worker cache use the same version.
- Do not leave a completed update under Unreleased or retain the previous displayed version. The user has explicitly requested version increments without reminders.
