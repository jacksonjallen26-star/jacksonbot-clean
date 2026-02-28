// public/widget.js

(function() {
  // Create a container if it doesn't exist
  function injectBot(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Create an iframe for your bot
    const iframe = document.createElement('iframe');
    iframe.src = '/'; // This loads your React app root
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';

    container.appendChild(iframe);
  }

  // Expose globally
  window.BotWidget = {
    init: function({ container }) {
      injectBot(container);
    }
  };
})();