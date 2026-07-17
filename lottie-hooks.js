// Lottie Hooks - Runs in MAIN world (page context)
// Injected via chrome.scripting.executeScript to bypass CSP
(function () {
  console.log("[Aligner] Initializing Lottie hooks...");

  const FLAG = "__ALIGNER__";
  const cache = [];
  window.__alignerLottieCache = cache;

  function looksLikeLottie(j) {
    return (
      j &&
      typeof j === "object" &&
      typeof j.v === "string" &&
      typeof j.fr === "number" &&
      typeof j.ip === "number" &&
      typeof j.op === "number" &&
      Array.isArray(j.layers)
    );
  }

  function post(type, payload) {
    window.postMessage({ [FLAG]: true, type, ...payload }, "*");
  }

  // Hook lottie/bodymovin loadAnimation
  function hookLottie(lib, name) {
    if (!lib || typeof lib.loadAnimation !== "function") return false;
    if (lib.loadAnimation.__alignerHooked) return true;

    const origLoad = lib.loadAnimation.bind(lib);
    lib.loadAnimation = function (params) {
      console.log("[Aligner Lottie] loadAnimation called", name, params);

      try {
        if (params?.path) {
          const url = new URL(params.path, location.href).href;
          post("LOTTIE_PATH", { url });
          console.log("[Aligner] Captured path:", url);
        }

        if (params?.animationData && looksLikeLottie(params.animationData)) {
          const text = JSON.stringify(params.animationData);
          post("LOTTIE_INLINE", { text, data: params.animationData });
          console.log("[Aligner] Captured inline animation");
        }
      } catch (e) {
        console.error("[Aligner] Hook error:", e);
      }

      return origLoad(params);
    };
    lib.loadAnimation.__alignerHooked = true;
    console.log("[Aligner] Hooked", name);
    return true;
  }

  // Try hooking immediately
  hookLottie(window.lottie, "lottie");
  hookLottie(window.bodymovin, "bodymovin");

  // Keep trying for delayed loads
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const lottieHooked = hookLottie(window.lottie, "lottie");
    const bodymovinHooked = hookLottie(window.bodymovin, "bodymovin");

    if (lottieHooked || bodymovinHooked || attempts > 50) {
      clearInterval(interval);
    }
  }, 200);

  // Hook fetch
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    // Wrap the entire fetch operation in try-catch to handle blocked requests
    try {
      const res = await origFetch.apply(this, args);

      try {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

        // Skip if response is opaque (CORS blocked) or not ok
        if (res.type === "opaque" || !res.ok) {
          return res;
        }

        const ct = (res.headers.get("content-type") || "").toLowerCase();

        if (url.includes(".json") || ct.includes("json")) {
          try {
            const clone = res.clone();
            const text = await clone.text();

            try {
              const json = JSON.parse(text);
              if (looksLikeLottie(json)) {
                post("LOTTIE_JSON", { url: clone.url || url, text });
                console.log("[Aligner] Captured fetch:", clone.url || url);
              }
            } catch {}
          } catch (cloneError) {
            // Silently fail on clone/read errors (usually CORS)
          }
        }
      } catch (e) {
        // Don't log CORS errors, they're expected
        if (e.name !== "TypeError" || !e.message.includes("CORS")) {
          console.warn("[Aligner] Fetch hook error:", e.message);
        }
      }

      return res;
    } catch (fetchError) {
      // If fetch fails (blocked by declarativeNetRequest, CORS, or network error),
      // return a fake failed Response instead of throwing to prevent console errors
      // This still allows calling code to handle the failure appropriately
      return Promise.reject(fetchError);
    }
  };

  // Hook XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__alignerUrl = url;
    return origOpen.call(this, method, url, ...rest);
  };

  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      try {
        // Skip if response status indicates error or CORS block
        if (this.status === 0 || this.status >= 400) {
          return;
        }

        const url = this.__alignerUrl || "";
        const ct = (this.getResponseHeader("content-type") || "").toLowerCase();

        if (url.includes(".json") || ct.includes("json")) {
          const text = this.responseText;
          if (!text) return;

          const json = JSON.parse(text);

          if (looksLikeLottie(json)) {
            const fullUrl = new URL(url, location.href).href;
            post("LOTTIE_JSON", { url: fullUrl, text });
            console.log("[Aligner] Captured XHR:", fullUrl);
          }
        }
      } catch {}
    });
    return origSend.apply(this, args);
  };

  console.log("[Aligner] Lottie hooks initialized successfully");
})();
