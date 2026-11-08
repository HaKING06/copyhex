export function icon(name) {
  const paths = {
    palette:
      '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="13" cy="7" r="1"/><circle cx="17" cy="11" r="1"/><path d="M11 21c-3-6 5-3 2-7"/>',
    picker: '<path d="m15 3 6 6-3 3-6-6zM13 7 4 16v4h4l9-9M3 21l2-2"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
    gradient:
      '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 3v18M11 3v18M15 3v18M19 4v16"/>',

    install:
      '<rect x="3" y="3" width="18" height="14" rx="3"/><path d="M8 21h8M12 17v4M9 10h6M12 7v6"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
    download:
      '<path d="M12 3v12m-4-4 4 4 4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  };
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.download}</svg>`;
}
