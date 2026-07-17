#!/usr/bin/env bash
# Build a Chrome-ready ZIP of Aligner (excludes docs, tests, and junk).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
VERSION="$(node -p "require('./manifest.json').version" 2>/dev/null || python3 -c "import json;print(json.load(open('manifest.json'))['version'])")"
OUT_DIR="${ROOT}/dist"
NAME="aligner-v${VERSION}"
STAGE="${OUT_DIR}/${NAME}"
ZIP="${OUT_DIR}/${NAME}.zip"

rm -rf "${STAGE}"
mkdir -p "${STAGE}"

rsync -a \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '.claude' \
  --exclude '.vscode' \
  --exclude '.hallmark' \
  --exclude 'docs' \
  --exclude 'dist' \
  --exclude 'node_modules' \
  --exclude 'test*.html' \
  --exclude 'test.html' \
  --exclude '*.md' \
  --exclude 'LICENSE' \
  --exclude 'PRIVACY.md' \
  --exclude 'scripts' \
  --exclude '.DS_Store' \
  --exclude 'afk_agent.py.save' \
  --exclude '/aligner-wp-tools-helper.zip' \
  --exclude 'lottie-hooks.js' \
  ./ "${STAGE}/"

# Ensure WordPress helper ZIP is always packaged (may be ignored by tooling filters)
mkdir -p "${STAGE}/wordpress"
cp -f "${ROOT}/wordpress/aligner-wp-tools-helper.zip" "${STAGE}/wordpress/aligner-wp-tools-helper.zip"

rm -f "${ZIP}"
(
  cd "${OUT_DIR}"
  zip -r -q "${NAME}.zip" "${NAME}"
)
echo "Built ${ZIP}"
ls -lh "${ZIP}"
ls -lh "${STAGE}/wordpress/"
