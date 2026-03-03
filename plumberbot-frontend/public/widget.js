// public/widget.js
(function() {
  const BACKEND_URL = "https://jacksonbot-clean-production.up.railway.app";

  function initWidget({ companyId, containerId = "body" }) {
    const container = document.querySelector(containerId);
    if (!container) return;

    // ----------------- Create Floating Button -----------------
    const chatButton = document.createElement("div");
    chatButton.id = "chat-button";
    chatButton.innerHTML = `<img src="jetai.png" alt="Chat Logo" />`;
    container.appendChild(chatButton);

    // ----------------- Create Chat Window -----------------
    const chatWindow = document.createElement("div");
    chatWindow.id = "chat-window";

    const chatIframe = document.createElement("iframe");
    chatIframe.id = "chat-iframe";
    chatIframe.src = `https://jacksonbot-clean.vercel.app/?companyId=${companyId}`;
    chatWindow.appendChild(chatIframe);

    container.appendChild(chatWindow);

    // ----------------- Floating Button Toggle -----------------
    chatButton.addEventListener("click", () => {
      chatWindow.classList.toggle("active");
    });

    // ----------------- Load company settings -----------------
    async function applyCompanyStyles() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/get-settings?companyId=${companyId}`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();

        chatButton.style.boxShadow = `0 0 10px ${data.primaryColor || "#4f46e5"}`;
        chatWindow.style.backgroundColor = data.primaryColor || "#ffffff";

        chatIframe.onload = () => {
          try {
            const iframeDoc = chatIframe.contentDocument || chatIframe.contentWindow.document;
            iframeDoc.documentElement.style.setProperty("--primary-color", data.primaryColor || "#4f46e5");
            iframeDoc.documentElement.style.setProperty("--text-color", data.textColor || "#000000");
          } catch (err) {
            console.warn("Cannot access iframe styling:", err);
          }
        };
      } catch (err) {
        console.error("Error loading company settings:", err);
      }
    }

    applyCompanyStyles();

    // ----------------- Inject CSS -----------------
    const style = document.createElement("style");
    style.textContent = `
      #chat-button {
        position: fixed; bottom: 20px; right: 20px;
        width: 48px; height: 48px; background: transparent;
        border-radius: 50%; display: flex; justify-content: center; align-items: center;
        cursor: pointer; z-index: 1000; transition: transform 0.3s, box-shadow 0.3s;
      }
      #chat-button:hover { transform: scale(1.1); }
      #chat-button img { width: 170%; height: 170%; object-fit: contain; }
      #chat-window {
        position: fixed; bottom: 90px; right: 20px; width: 400px; height: 600px;
        border-radius: 14px; display: flex; flex-direction: column; overflow: hidden;
        transform: translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s ease;
        z-index: 1000; background: white;
      }
      #chat-window.active { transform: translateY(0); opacity: 1; pointer-events: auto; }
      #chat-iframe { flex: 1; border: none; }
      @media(max-width:768px){
        #chat-window { width:280px; height:400px; bottom:80px; right:20px; border-radius:12px; }
      }
    `;
    document.head.appendChild(style);
  }

  window.BotWidget = { init: initWidget };
})();