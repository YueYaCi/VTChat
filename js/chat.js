// Chat module
const Chat = {
  async send() {
    const { input, send: btn, messages: container } = DOM.chat;
    const text = input.value.trim();
    if (!text || !State.user || State.isChatSending) return;

    State.isChatSending = true;
    Utils.setLoading(btn, true);

    const msgId = Date.now().toString(36);
    Utils.addLog("INFO", "CHAT", "User message", { id: msgId, length: text.length, preview: text.slice(0, 50) });

    UI.appendChatMessage('user', text);
    State.messages.push({ role: "user", content: text });

    input.value = "";
    Utils.autoResize(input);

    const bubble = UI.appendChatMessage('assistant', '', true);
    const startTime = performance.now();
    UI.updateApiInfo("Requesting...");

    try {
      const token = await API.getToken();
      const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/deepseek-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          messages: State.messages,
          provider: State.model.provider,
          settings: Settings.get()
        })
      });

      const returnedUrl = response.headers.get("X-Actual-API-URL");
      if (returnedUrl) {
        State.apiUrl = returnedUrl;
        DOM.api.url.textContent = State.apiUrl;
      }

      Utils.addLog("INFO", "API", "Response received", { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const fullReply = await Chat.handleStream(response, bubble);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      State.messages.push({ role: "assistant", content: fullReply });
      Utils.addLog("INFO", "API", "Stream done", { elapsed: elapsed + "s", length: fullReply.length });
      UI.updateApiInfo("Success", fullReply.length);
    } catch (err) {
      bubble.innerHTML = Utils.formatContent("请求出错：" + err.message);
      Utils.addLog("ERROR", "API", "Chat failed", { error: err.message });
      UI.updateApiInfo("Failed");
    } finally {
      State.isChatSending = false;
      Utils.setLoading(btn, false);
      container.scrollTop = container.scrollHeight;
    }
  },

  async handleStream(response, bubbleEl) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";
    let chunkCount = 0;
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (!value) continue;

      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullReply += delta;
            bubbleEl.textContent = fullReply;
          }
        } catch (e) {}
      }
    }

    bubbleEl.innerHTML = Utils.formatContent(fullReply);
    return fullReply;
  }
};
