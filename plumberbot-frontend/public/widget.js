// public/widget.js
(function() {
  function injectBot(containerSelector, companyId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = ''; // clear previous content

    const iframe = document.createElement('iframe');
    iframe.src = `https://jacksonbot-clean.vercel.app/?companyId=${companyId}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';

    container.appendChild(iframe);
  }

  window.BotWidget = {
    init: function({ container, companyId }) {
      injectBot(container, companyId);
    }
  };
})();