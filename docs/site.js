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

  function setupShotLightbox() {
    const dialog = document.getElementById("shot-lightbox");
    const img = document.getElementById("shot-lightbox-img");
    const caption = document.getElementById("shot-lightbox-caption");
    const closeBtn = document.getElementById("shot-lightbox-close");
    if (!dialog || !img || !caption) return null;

    const close = () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    };

    closeBtn?.addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) close();
    });

    return (src, text) => {
      img.src = src;
      img.alt = text || "Product screenshot";
      caption.textContent = text || "";
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };
  }

  function wireScreenshotLightbox() {
    const open = setupShotLightbox();
    if (!open) return;

    document.querySelectorAll(".shot").forEach((figure) => {
      const img = figure.querySelector("img");
      const caption = figure.querySelector("figcaption");
      if (!img) return;

      figure.tabIndex = 0;
      figure.setAttribute("role", "button");
      const label = caption?.textContent?.trim() || img.alt || "Open screenshot";
      figure.setAttribute("aria-label", `Open screenshot: ${label}`);

      const show = () => open(img.currentSrc || img.src, label);
      figure.addEventListener("click", show);
      figure.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          show();
        }
      });
    });

    const hero = document.querySelector(".hero-visual");
    const heroImg = hero?.querySelector("img");
    if (hero && heroImg) {
      hero.tabIndex = 0;
      hero.setAttribute("role", "button");
      hero.setAttribute("aria-label", "Open hero screenshot");
      const showHero = () =>
        open(heroImg.currentSrc || heroImg.src, heroImg.alt || "Aligner preview");
      hero.addEventListener("click", showHero);
      hero.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showHero();
        }
      });
    }
  }

  if (starBtn) {
    starBtn.href = `https://github.com/${REPO}`;
  }

  loadLatestRelease();
  wireScreenshotLightbox();
})();
