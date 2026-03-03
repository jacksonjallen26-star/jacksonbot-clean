// public/widget.js
(function() {
  function injectBot({ containerSelector, companyId }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create floating button
    const chatButton = document.createElement('div');
    chatButton.id = 'chat-button';
    chatButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: transparent;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 1000;
      transition: transform 0.3s;
    `;

    const img = document.createElement('img');
    img.src = 'jetai.png'; // replace with your logo
    img.alt = 'Chat Logo';
    img.style.cssText = 'width: 170%; height: 170%; object-fit: contain;';
    chatButton.appendChild(img);

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 600px;
      background: white;
      border-radius: 14px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
      z-index: 1000;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = `https://jacksonbot-clean.vercel.app/?companyId=${companyId}`;
    iframe.id = 'chat-iframe';
    iframe.style.cssText = 'flex:1; border:none; border-radius:8px;';
    chatWindow.appendChild(iframe);

    // Toggle chat window
    chatButton.addEventListener('click', () => {
      if (chatWindow.style.opacity === '1') {
        chatWindow.style.opacity = '0';
        chatWindow.style.pointerEvents = 'none';
        chatWindow.style.transform = 'translateY(20px)';
      } else {
        chatWindow.style.opacity = '1';
        chatWindow.style.pointerEvents = 'auto';
        chatWindow.style.transform = 'translateY(0)';
      }
    });

    // Append to document
    document.body.appendChild(chatButton);
    document.body.appendChild(chatWindow);
  }

  // Expose global object
  window.BotWidget = {
    init: function({ container, companyId }) {
      injectBot({ containerSelector: container, companyId });
    }
  };
})();