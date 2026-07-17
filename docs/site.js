(() => {
  const REPO = "Gtarafdar/aligner";
  const FALLBACK_ZIP =
    `https://github.com/${REPO}/releases/latest/download/aligner.zip`;
  const FALLBACK_TAG = "latest";
  const QUEST_KEYS = [
    "overview",
    "layout",
    "inspect",
    "color",
    "quality",
    "utilities",
    "wordpress",
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const downloadBtns = document.querySelectorAll("[data-download-zip]");
  const versionEls = document.querySelectorAll("[data-release-version]");
  const releaseNote = document.getElementById("release-note");
  const starBtn = document.getElementById("star-github");
  const unlocked = new Set();

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

  function animateCounters() {
    const nodes = document.querySelectorAll("[data-count-to]");
    if (!nodes.length) return;

    const run = (el) => {
      const target = Number(el.getAttribute("data-count-to") || "0");
      if (reducedMotion) {
        el.textContent = String(target);
        return;
      }
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function unlockQuest(key) {
    if (!QUEST_KEYS.includes(key) || unlocked.has(key)) return;
    unlocked.add(key);

    const badge = document.querySelector(`[data-badge="${key}"]`);
    badge?.classList.add("is-unlocked");

    const count = unlocked.size;
    const total = QUEST_KEYS.length;
    const countEl = document.getElementById("quest-count");
    const fill = document.getElementById("quest-fill");
    const hint = document.getElementById("quest-hint");

    if (countEl) countEl.textContent = String(count);
    if (fill) fill.style.width = `${Math.round((count / total) * 100)}%`;
    if (hint) {
      hint.textContent =
        count >= total
          ? "All tool groups unlocked. Ready to download and explore in Chrome."
          : `${total - count} group${total - count === 1 ? "" : "s"} left on the explorer path.`;
    }
  }

  function setupRevealAndQuest() {
    const reveals = document.querySelectorAll("[data-reveal]");
    if (reducedMotion) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      QUEST_KEYS.forEach(unlockQuest);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          const quest = entry.target.getAttribute("data-quest");
          if (quest) unlockQuest(quest);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function setupScrollChrome() {
    const bar = document.getElementById("scroll-progress");
    const topBtn = document.getElementById("scroll-top");
    const ring = document.getElementById("scroll-top-fg");
    const circumference = 97.4;

    const sync = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar) bar.style.width = `${ratio * 100}%`;
      if (ring) ring.style.strokeDashoffset = String(circumference * (1 - ratio));
      if (topBtn) {
        const show = window.scrollY > 480;
        topBtn.hidden = !show;
        topBtn.classList.toggle("is-visible", show);
      }
    };

    topBtn?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  function setupPresetPlay() {
    const chips = document.querySelectorAll("[data-preset]");
    const feedback = document.getElementById("preset-feedback");
    if (!chips.length) return;

    const clearSpotlight = () => {
      document
        .querySelectorAll(".is-spotlight")
        .forEach((el) => el.classList.remove("is-spotlight"));
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.toggle("is-active", c === chip));
        clearSpotlight();

        const groups = (chip.getAttribute("data-groups") || "")
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean);

        groups.forEach((group) => {
          document
            .querySelectorAll(`[data-group="${group}"], #${group}`)
            .forEach((el) => el.classList.add("is-spotlight"));
        });

        const label = chip.querySelector("strong")?.textContent || "preset";
        if (feedback) {
          feedback.textContent = `“${label}” spotlighted ${groups.length} group${
            groups.length === 1 ? "" : "s"
          }. Scroll up to see them glow.`;
        }

        const first = document.querySelector(`#${groups[0]}`) || document.querySelector(`[data-group="${groups[0]}"]`);
        first?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      });
    });
  }

  function setupStickyQuest() {
    const header = document.querySelector(".site-header");
    const sticky = document.getElementById("quest-sticky");
    const panel = document.getElementById("quest-panel");
    if (!header || !sticky || !panel) return;

    const syncHeaderOffset = () => {
      const h = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-offset", `${h}px`);
    };

    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset);

    const sentinel = document.createElement("div");
    sentinel.className = "quest-sticky-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    sticky.parentElement?.insertBefore(sentinel, sticky);

    const compactObserver = new IntersectionObserver(
      ([entry]) => {
        sticky.classList.toggle("is-compact", !entry.isIntersecting);
      },
      { rootMargin: `-${header.getBoundingClientRect().height + 8}px 0px 0px 0px`, threshold: 0 },
    );
    compactObserver.observe(sentinel);

    const sectionIds = {
      overview: "features",
      layout: "layout",
      inspect: "inspect",
      color: "color",
      quality: "quality",
      utilities: "utilities",
      wordpress: "wordpress",
    };

    const setActive = (key) => {
      document.querySelectorAll("[data-badge]").forEach((el) => {
        el.classList.toggle("is-active", el.getAttribute("data-badge") === key);
      });
    };

    document.querySelectorAll("[data-badge]").forEach((badge) => {
      const key = badge.getAttribute("data-badge");
      const targetId = sectionIds[key];
      if (!targetId) return;
      badge.setAttribute("role", "link");
      badge.tabIndex = 0;
      badge.setAttribute("aria-label", `Jump to ${badge.textContent.trim()}`);

      const jump = () => {
        const target = document.getElementById(targetId);
        if (!target) return;
        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          header.getBoundingClientRect().height -
          sticky.getBoundingClientRect().height -
          12;
        window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
        setActive(key);
      };

      badge.addEventListener("click", jump);
      badge.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          jump();
        }
      });
    });

    const sections = QUEST_KEYS.map((key) => document.getElementById(sectionIds[key])).filter(Boolean);
    if (!sections.length) return;

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const id = visible[0].target.id;
        const key = Object.keys(sectionIds).find((k) => sectionIds[k] === id);
        if (key) setActive(key);
      },
      {
        rootMargin: `-${header.getBoundingClientRect().height + sticky.getBoundingClientRect().height + 24}px 0px -45% 0px`,
        threshold: [0.15, 0.35, 0.55],
      },
    );

    sections.forEach((section) => activeObserver.observe(section));
    setActive("overview");
  }

  function setupAudienceStack() {
    const list = document.querySelector(".audience-list[data-stack]");
    if (!list) return;

    const pins = [...list.querySelectorAll(".audience-pin")];
    if (!pins.length) return;

    const countEl = document.getElementById("audience-stack-count");
    const desktop = window.matchMedia("(min-width: 861px)");
    let ticking = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const reset = () => {
      pins.forEach((pin) => {
        pin.classList.remove("is-behind", "is-active");
        const card = pin.querySelector(".audience-row");
        if (!card) return;
        card.style.removeProperty("--stack-scale");
        card.style.removeProperty("--stack-y");
        card.style.removeProperty("--stack-bright");
        card.style.removeProperty("--stack-depth");
      });
      if (countEl) countEl.textContent = "1";
    };

    const update = () => {
      ticking = false;

      if (reducedMotion || !desktop.matches) {
        reset();
        return;
      }

      const header = document.querySelector(".site-header");
      const stickTop = (header?.getBoundingClientRect().height || 72) + 16;
      const viewport = window.innerHeight || 800;
      let active = 0;

      pins.forEach((pin, index) => {
        const card = pin.querySelector(".audience-row");
        if (!card) return;

        const next = pins[index + 1];
        const rect = pin.getBoundingClientRect();
        const stuck = rect.top <= stickTop + 1;

        if (stuck) active = index;

        let progress = 0;
        if (next) {
          const nextTop = next.getBoundingClientRect().top;
          progress = clamp(1 - (nextTop - stickTop) / (viewport * 0.55), 0, 1);
        }

        const scale = 1 - progress * 0.07;
        const lift = progress * 10;
        const bright = 1 - progress * 0.06;

        card.style.setProperty("--stack-scale", scale.toFixed(4));
        card.style.setProperty("--stack-y", `${lift.toFixed(1)}px`);
        card.style.setProperty("--stack-bright", bright.toFixed(4));
        card.style.setProperty("--stack-depth", progress.toFixed(4));

        pin.classList.toggle("is-behind", progress > 0.08);
        pin.classList.toggle("is-active", false);
      });

      pins[active]?.classList.add("is-active");
      if (countEl) countEl.textContent = String(active + 1);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const bind = () => {
      reset();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", bind);
    desktop.addEventListener("change", bind);
    bind();
  }

  if (starBtn) {
    starBtn.href = `https://github.com/${REPO}`;
  }

  loadLatestRelease();
  wireScreenshotLightbox();
  animateCounters();
  setupRevealAndQuest();
  setupStickyQuest();
  setupAudienceStack();
  setupScrollChrome();
  setupPresetPlay();
})();
