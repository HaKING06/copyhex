# Security

Supported version: 1.0.1.

Report security issues privately to **copyhex@haking.tr** with reproduction steps, affected browser and impact. Please avoid placing sensitive personal information or exploit details in public issues before review.

CopyHex is a static client-side application. Palette names and notes are escaped before display; imports validate file size, color codes and palette structure. There are no application passwords, API keys or server-side user records. Cloudflare Pages applies the repository's Content Security Policy and security headers.

Do not commit secrets. Browser storage and offline caching are convenience features, not encrypted storage for confidential information.
