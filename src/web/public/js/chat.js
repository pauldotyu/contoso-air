(function () {
  const launcher = document.getElementById("ca-chat-launcher");
  const panel = document.getElementById("ca-chat-panel");
  const closeBtn = panel?.querySelector("button.close");
  const form = document.getElementById("ca-chat-form");
  const input = document.getElementById("ca-chat-input");
  const messagesEl = document.getElementById("ca-chat-messages");

  // Dev technical message (lower-left)
  const devLauncher = document.getElementById("ca-dev-launcher");
  const devPanel = document.getElementById("ca-dev-panel");
  const devCloseBtn = devPanel?.querySelector("button.close");

  if (!launcher || !panel || !form || !input || !messagesEl) return;

  const state = {
    messages: [], // {role: 'user'|'assistant', content: string}
  };

  function appendMessage(role, content) {
    const item = document.createElement("div");
    item.className = `msg ${role}`;
    item.textContent = content;
    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function toggle(open) {
    const shouldOpen =
      open !== undefined ? open : panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !shouldOpen);
    launcher.style.display = shouldOpen ? "none" : "inline-flex";
    if (shouldOpen) input.focus();
  }

  launcher.addEventListener("click", () => toggle(true));
  closeBtn?.addEventListener("click", () => toggle(false));

  // Initialize dev panel: only toggles visibility; message is server-rendered; sending disabled
  if (devLauncher && devPanel) {
    function toggleDev(open) {
      const shouldOpen = open !== undefined ? open : devPanel.classList.contains("hidden");
      devPanel.classList.toggle("hidden", !shouldOpen);
      devLauncher.style.display = shouldOpen ? "none" : "inline-flex";
      // no input focus: sending is disabled
    }

    devLauncher.addEventListener("click", () => toggleDev(true));
    devCloseBtn?.addEventListener("click", () => toggleDev(false));
  }

  // Warm greeting
  appendMessage(
    "assistant",
    "Hi! I'm your AI travel assistant. How can I help today"
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;
    input.value = "";

    state.messages.push({ role: "user", content: text });
    appendMessage("user", text);

    // Show typing indicator
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "Assistant is typing…";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: state.messages }),
      });
      const data = await res.json();
      typing.remove();
      if (!res.ok) throw new Error(data?.error || "Failed");
      const reply = data.reply || "Sorry, I did not understand that.";
      state.messages.push({ role: "assistant", content: reply });
      appendMessage("assistant", reply);
    } catch (err) {
      typing.remove();
      appendMessage("assistant", "Sorry, I'm having trouble right now.");
      console.error(err);
    }
  });
})();
