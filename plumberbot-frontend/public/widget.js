// public/widget.js
(function() {
  function injectBot(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = 'https://jacksonbot-clean.vercel.app/'; // <- Use the full URL
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';

    container.appendChild(iframe);
  }

  window.BotWidget = {
    init: function({ container }) {
      injectBot(container);
    }
  };
})();