# JobSwipe LP — Static HTML Export

Standalone HTML export of the `/lp` landing page.

## Files

```
exports/jobswipe-lp/
├── index.html          # Landing page
├── lp.css              # Styles
└── uploads/
    ├── logo-mark.webp
    └── JobSwipe-top.webp
```

## Preview

Open `index.html` in a browser, or run a local server:

```bash
npx serve exports/jobswipe-lp
```

## Notes

- This is a static snapshot. Contact CTA uses `mailto:` links.
- Privacy/terms links point to the production site (`jobswipe.jp`).
- Regenerate when `/lp` content or styles change in the Next.js app.
