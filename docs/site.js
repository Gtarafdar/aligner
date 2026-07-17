(() => {
  const REPO = "Gtarafdar/aligner";
  const FALLBACK_ZIP =
    `https://github.com/${REPO}/releases/latest/download/aligner.zip`;
  const FALLBACK_TAG = "latest";

  const downloadBtns = document.querySelectorAll("[data-download-zip]");
  const versionEls = document.querySelectorAll("[data-release-version]");
  const releaseNote = document.getElementById("release-note");
  const starBtn = document.getElementById("star-github");

  function setDownloads(url, label) {
    downloadBtns.forEach((btn) => {
      btn.href = url;
      if (btn.dataset.downloadLabel !== "static") {
        const span = btn.querySelector("[data-label]");
        if (span && label) span.textContent = label;
      }
    });
  }

  function setVersion(text) {
    versionEls.forEach((el) => {
      el.textContent = text;
    });
  }

  async function loadLatestRelease() {
    setDownloads(FALLBACK_ZIP, "Download ZIP");
    setVersion(FALLBACK_TAG);

    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/releases/latest`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tag = data.tag_name || FALLBACK_TAG;
      setVersion(tag);

      const assets = Array.isArray(data.assets) ? data.assets : [];
      const zip =
        assets.find((a) => a.name === "aligner.zip") ||
        assets.find((a) => /^aligner-v.+\.zip$/i.test(a.name)) ||
        assets.find((a) => /\.zip$/i.test(a.name));

      if (zip?.browser_download_url) {
        setDownloads(zip.browser_download_url, `Download ${tag} · ZIP`);
        if (releaseNote) {
          releaseNote.textContent = `Latest release ${tag} · published ${new Date(
            data.published_at,
          ).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}. Re-download and reload the unpacked folder in chrome://extensions to update.`;
        }
      } else {
        setDownloads(data.html_url || `https://github.com/${REPO}/releases`, "Get ZIP from Releases");
        if (releaseNote) {
          releaseNote.textContent =
            "Release assets are preparing. Use GitHub Releases if the direct ZIP is not ready yet.";
        }
      }
    } catch (_) {
      if (releaseNote) {
        releaseNote.textContent =
          "Showing the latest-release download link. If a release is not published yet, use View source on GitHub.";
      }
    }
  }

  if (starBtn) {
    starBtn.href = `https://github.com/${REPO}`;
  }

  loadLatestRelease();
})();
