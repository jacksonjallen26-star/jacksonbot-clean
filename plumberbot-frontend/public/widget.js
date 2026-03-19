(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
  var config = window.AskraConfig || {};
  var companyId = config.companyId;

  if (!companyId) {
    console.error("Askra: missing companyId in window.AskraConfig");
    return;
  }

  var isOpen = false;
  var BACKEND_URL = "https://jacksonbot-clean-production.up.railway.app";
  var WIDGET_URL = "https://jacksonbot-clean.vercel.app";

  // Inject styles
  var style = document.createElement("style");
  style.innerHTML = `
    #askra-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #7c3aed;
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(124, 58, 237, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      padding: 0;
      overflow: hidden;
    }

    #askra-bubble img { 
    width: 160%; 
    height: 160%; 
    object-fit:cover; 
    border-radius: 50%; 
    display: block; }

  
    #askra-bubble svg {
      width: 24px;
      height: 24px;
      fill: white;
      flex-shrink: 0;
    }

    #askra-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 380px;
      height: 580px;
      border-radius: 16px;
      overflow: hidden;
      z-index: 99998;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid #1e1e2e;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
    }

    #askra-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    #askra-window iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    @media (max-width: 480px) {
      #askra-window {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        right: 8px;
        bottom: 84px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create bubble button
  var bubble = document.createElement("button");
  bubble.id = "askra-bubble";
  bubble.setAttribute("aria-label", "Open chat");

  // Create chat window
  var chatWindow = document.createElement("div");
  chatWindow.id = "askra-window";

  var iframe = document.createElement("iframe");
  iframe.src = "about:blank";
  iframe.allow = "clipboard-write";
  chatWindow.appendChild(iframe);

  // Default bubble icon
  function setChatIcon() {
    bubble.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
  }

  function setCloseIcon() {
    bubble.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;
  }

  // Fetch company settings and apply to bubble
  fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      // Apply bubble color
      if (data.bubbleColor) {
        bubble.style.background = data.bubbleColor;
      }

      // Apply bubble logo or default
      if (data.bubbleLogoUrl) {
        var img = document.createElement("img");
        img.src = data.bubbleLogoUrl;
        img.alt = "Chat";
        img.onerror = function () {
          // If image fails to load fall back to chat icon
          setChatIcon();
        };
        bubble.innerHTML = "";
        bubble.appendChild(img);
      } else {
        setChatIcon();
      }
    })
    .catch(function () {
      // If fetch fails use defaults
      setChatIcon();
    });

  // Toggle open/close
  bubble.addEventListener("click", function () {
    isOpen = !isOpen;

    if (isOpen) {
      if (iframe.src === "about:blank") {
        iframe.src = `${WIDGET_URL}/?companyId=${companyId}`;
      }
      chatWindow.classList.add("open");
      bubble.setAttribute("aria-label", "Close chat");
      setCloseIcon();
    } else {
      chatWindow.classList.remove("open");
      bubble.setAttribute("aria-label", "Open chat");

      // Restore logo or chat icon after closing
      fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.bubbleLogoUrl) {
            bubble.style.background = "transparent";
            var img = document.createElement("img");
            img.src = data.bubbleLogoUrl;
            img.alt = "Chat";
            img.onerror = setChatIcon;
            bubble.innerHTML = "";
            bubble.appendChild(img);
          } else {
            setChatIcon();
          }
          if (data.bubbleColor) {
            bubble.style.background = data.bubbleColor;
          }
        })
        .catch(setChatIcon);
    }
  });

  document.body.appendChild(chatWindow);
  document.body.appendChild(bubble);
  }
})();