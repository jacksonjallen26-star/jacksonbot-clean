// public/widget.js
(function() {
  async function fetchSettings(companyId) {
    try {
      const res = await fetch(`https://jacksonbot-backend.up.railway.app/api/get-settings?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return await res.json();
    } catch (err) {
      console.error("Widget fetchSettings error:", err);
      return null;
    }
  }

  function createFloatingButton(logoUrl) {
    const button = document.createElement("div");
    button.id = "chat-button";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.width = "48px";
    button.style.height = "48px";
    button.style.borderRadius = "50%";
    button.style.background = "transparent";
    button.style.display = "flex";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.style.cursor = "pointer";
    button.style.zIndex = "1001";
    button.style.transition = "transform 0.3s";

    const img = document.createElement("img");
    img.src = logoUrl;
    img.style.width = "170%";
    img.style.height = "170%";
    img.style.objectFit = "contain";

    button.appendChild(img);
    document.body.appendChild(button);

    button.addEventListener("mouseenter", () => button.style.transform = "scale(1.1)");
    button.addEventListener("mouseleave", () => button.style.transform = "scale(1)");

    return button;
  }

  function createChatWindow() {
    const windowDiv = document.createElement("div");
    windowDiv.id = "chat-window";
    windowDiv.style.position = "fixed";
    windowDiv.style.bottom = "90px";
    windowDiv.style.right = "20px";
    windowDiv.style.width = "400px";
    windowDiv.style.height = "600px";
    windowDiv.style.borderRadius = "14px";
    windowDiv.style.zIndex = "1000";
    windowDiv.style.display = "none";
    windowDiv.style.boxShadow = "0 15px 40px rgba(0,0,0,0.35)";
    windowDiv.style.overflow = "hidden";

    document.body.appendChild(windowDiv);
    return windowDiv;
  }

  function injectIframe(container, companyId) {
    container.innerHTML = ""; // clear previous iframe
    const iframe = document.createElement("iframe");
    iframe.src = `https://jacksonbot-clean.vercel.app/?companyId=${companyId}`;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    container.appendChild(iframe);
  }

  async function initWidget(companyId) {
    const settings = await fetchSettings(companyId);
    if (!settings) return;

    const chatButton = createFloatingButton(settings.logoUrl);
    const chatWindow = createChatWindow();

    // Toggle chat window
    chatButton.addEventListener("click", () => {
      chatWindow.style.display = chatWindow.style.display === "none" ? "block" : "none";
    });

    // Inject iframe
    injectIframe(chatWindow, companyId);

    // Mobile responsiveness
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @media(max-width:768px) {
        #chat-window { width: 280px; height: 400px; bottom: 80px; right: 20px; }
      }
    `;
    document.head.appendChild(styleTag);
  }

  window.BotWidget = {
    init: initWidget
  };
})();