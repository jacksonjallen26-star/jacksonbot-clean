// public/widget.js
(function () {
  function injectBot(containerSelector, companyId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Prevent duplicate iframe
    if (container.querySelector("iframe")) return;

    const iframe = document.createElement("iframe");

    iframe.src = `https://jacksonbot-clean.vercel.app/?companyId=${companyId}`;
    iframe.allow = "clipboard-write";
    iframe.loading = "lazy";

    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    iframe.style.background = "transparent";

    iframe.onerror = function () {
      container.innerHTML = "Chat failed to load.";
    };

    container.appendChild(iframe);
  }

  window.BotWidget = {
    init: function ({ container, companyId }) {
      if (!container || !companyId) {
        console.error("BotWidget.init requires container and companyId");
        return;
      }

      injectBot(container, companyId);
    }
  };
})();