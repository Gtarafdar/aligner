# Aligner

> Free Chrome extension for visual design, measurement, quality checks, and WordPress builder tools.

**Landing page:** https://gtarafdar.github.io/aligner/  
**License:** MIT · **Author:** [Gobinda Tarafdar](https://gtarafdar.com/bio/)

<p align="center">
  <img src="assets/icons/icon128.png" width="96" height="96" alt="Aligner icon" />
</p>

<p align="center">
  <a href="https://gtarafdar.github.io/aligner/"><img src="https://img.shields.io/badge/GitHub%20Pages-live-0f6b5c?style=for-the-badge" alt="GitHub Pages" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" /></a>
  <a href="https://github.com/Gtarafdar/aligner/releases/latest"><img src="https://img.shields.io/github/v/release/Gtarafdar/aligner?style=for-the-badge" alt="Latest release" /></a>
  <a href="https://github.com/Gtarafdar/aligner/stargazers"><img src="https://img.shields.io/github/stars/Gtarafdar/aligner?style=for-the-badge" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
</p>

<p align="center">
  <a href="https://github.com/Gtarafdar/aligner/releases/latest/download/aligner.zip"><strong>Download ZIP</strong></a>
  ·
  <a href="https://gtarafdar.github.io/aligner/"><strong>Website</strong></a>
  ·
  <a href="https://github.com/Gtarafdar/aligner"><strong>★ Star</strong></a>
  ·
  <a href="https://gtarafdar.com/donate"><strong>Donate</strong></a>
</p>

---

## About the maker

<p align="center">
  <img src="assets/brand/gobinda-tarafdar.png" width="160" height="160" alt="Gobinda Tarafdar" />
</p>

**Gobinda Tarafdar** — WordPress product marketer by trade, stubborn problem-solver by habit, lifelong Harry Potter devotee by heart.

By day I am the Product Marketing Specialist at [WPBakery](https://wpbakery.com/), the page builder that quietly powers a sizeable corner of the WordPress universe. Before that, I helped a single plugin cross **400,000+ active users**. When the day-job owl flies home, I tinker on my own workshop of spells. **Aligner** is one of them.

- [X / Twitter](https://x.com/Gtarafdarr)
- [LinkedIn](https://www.linkedin.com/in/gobinda-tarafdar/)
- [Donate](https://gtarafdar.com/donate)
- [GitHub](https://github.com/Gtarafdar)

---

## What Aligner does

| Group | Tools |
| --- | --- |
| **Layout** | Rulers, Guides, Grids, Measure, Drawing |
| **Inspect** | Inspect, Responsive, Wireframe |
| **Color & media** | Color Picker, Palette, Media |
| **Quality** | Accessibility, Design Check, Page Speed, Design System |
| **Utilities** | Cache Cleaner, Page Load Timer, Page Controls |
| **WordPress** | WP Tools panel — admin bar, smart editor, detector, backlog, Role switcher, Theme switcher, ACF Tools, and more |

Optional **Aligner WP Tools Helper** (bundled ZIP) unlocks Role switcher and private Theme preview. Most WP features work without it.

---

## Install (Load unpacked)

1. Download [`aligner.zip`](https://github.com/Gtarafdar/aligner/releases/latest/download/aligner.zip) from [Releases](https://github.com/Gtarafdar/aligner/releases).
2. Unzip to a permanent folder.
3. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the folder with `manifest.json`.
4. Open **Aligner Home** from the popup footer or Settings → Workspace.

### Updates

Chrome auto-updates only apply to Chrome Web Store listings. For the GitHub ZIP:

1. Watch this repo / Releases.
2. Download the latest ZIP, replace your unpacked files, click **Reload** on `chrome://extensions`.

Tagged releases (`v*`) build the ZIP via GitHub Actions (see `.github/workflows/release.yml`).

---

## Also from the workshop

| Project | Description |
| --- | --- |
| [WPBakery](https://wpbakery.com/) | Page builder I do product marketing for |
| [Docscriber](https://thedocscriber.com/) | Documentation, conjured |
| [TheRecaller](https://therecaller.com/) | A memory charm for what you forget online |
| [TheEditra](https://theeditra.com/) | AI video editor |
| [The Quill Press](https://thequillpress.com/) | Tech news, Daily Prophet style |
| [Costlas](https://costlas.com/) | Cost of living for 140+ countries |
| [Auto AFK Slack](https://gtarafdar.github.io/auto-afk-slack/) | Lock your Mac, Slack goes AFK |
| [Slack Teammate Time](https://gtarafdar.github.io/slack-teammate-local-time/) | Teammate local times inline in Slack |
| [FinderFlow](https://gtarafdar.github.io/FinderFlow/) | Mac file manager with built-in editor |
| [Slack Agent Bridge](https://gtarafdar.github.io/slack-agent-bridge/) | MCP bridge for Cursor/Claude, local archive, automations |
| [Broken Link Checker](https://gtarafdar.github.io/broken-link-checker/) | Find broken links without leaving the page |

---

## Privacy

See [PRIVACY.md](PRIVACY.md). No account. No analytics endpoint in this repo.

## AI / agents

Machine-readable summary: [docs/llms.txt](docs/llms.txt) · https://gtarafdar.github.io/aligner/llms.txt

## Development

```bash
# Package a Chrome-ready ZIP locally
./scripts/package-extension.sh
```

Extension source lives at the repo root (`manifest.json`, `popup/`, `content/`, `welcome/`, …). Marketing site is in `docs/` (GitHub Pages).

## License

[MIT](LICENSE) © 2026 Gobinda Tarafdar
