# Aligner release packaging

Build a Chrome-ready ZIP locally:

```bash
./scripts/package-extension.sh
# → dist/aligner-vX.Y.Z.zip
```

Publish a GitHub Release (example):

```bash
./scripts/package-extension.sh
cp dist/aligner-v*.zip dist/aligner.zip
gh release create v1.1.0 \
  dist/aligner.zip \
  dist/aligner-v1.1.0.zip \
  wordpress/aligner-wp-tools-helper.zip \
  --title "Aligner v1.1.0" \
  --notes "See README for install steps."
```

The landing page (`docs/site.js`) always points Download buttons at the **latest** release asset named `aligner.zip`.

> Note: An Actions workflow that auto-packages on `v*` tags needs a GitHub token with the `workflow` scope. Until then, publish releases manually with the commands above.
