// UI rendering functions
const UI = {
  switchView(view) {
    if (view === 'app') {
      DOM.login.container.classList.add('hidden');
      DOM.app.container.classList.remove('hidden');
    } else {
      DOM.app.container.classList.add('hidden');
      DOM.login.container.classList.remove('hidden');
    }
  },

  updateApiInfo(status, respLen = null) {
    const { model, url, rounds, lastTime, status: st, respLen: rl } = DOM.api;
    if (model) model.textContent = State.model.name;
    if (url) url.textContent = State.apiUrl;
    if (rounds) rounds.textContent = State.messages.length - 1;
    if (lastTime) lastTime.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    if (st) st.textContent = status;
    if (rl) rl.textContent = respLen !== null ? `${respLen} chars` : "—";
  },

  appendChatMessage(role, content = '', isStreaming = false) {
    const container = DOM.chat.messages;
    const row = document.createElement("div");
    row.className = `message-row ${role}`;

    const avatarSrc = role === 'user'
      ? State.avatar
      : (CONFIG.MODELS.find(m => m.provider === State.model.provider)?.avatar || 'avatars/deepseek.png');

    row.innerHTML = `<img class="message-avatar" src="${avatarSrc}" alt="" onerror="this.style.visibility='hidden'">`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    if (isStreaming) {
      bubble.textContent = content;
    } else {
      bubble.innerHTML = Utils.formatContent(content);
    }

    row.appendChild(bubble);
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    return bubble;
  },

  appendDiscussMessage(msg, isOwn = false) {
    const container = DOM.discuss.messages;
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `discuss-msg ${isOwn || msg.user_id === State.user?.id ? 'own' : ''}`;
    msgDiv.dataset.msgId = msg.id || '';

    const timeStr = msg.created_at ? Utils.formatTime(msg.created_at) : '';

    msgDiv.innerHTML = `
      <img class="discuss-avatar" src="avatars/${msg.nickname}.png" alt="" onerror="this.style.visibility='hidden'">
      <div class="discuss-content-wrapper">
        <div class="discuss-content">
          <span class="discuss-nickname">${Utils.escapeHtml(msg.nickname)}</span>${Utils.escapeHtml(msg.content).replace(/\n/g, '<br>')}
        </div>
        ${timeStr ? `<div class="discuss-time">${timeStr}</div>` : ''}
      </div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  },

  toggleModelDropdown() {
    const existing = document.querySelector(".model-dropdown");
    if (existing) {
      existing.remove();
      State.dropdownOpen = false;
      return;
    }

    const dropdown = document.createElement("div");
    dropdown.className = "model-dropdown";

    CONFIG.MODELS.forEach(m => {
      const option = document.createElement("div");
      option.className = `model-option ${m.name === State.model.name ? "active" : ""}`;
      option.innerHTML = `<img class="model-option-icon" src="${m.avatar}" alt=""><span>${m.label}</span>`;
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        UI.selectModel(m);
      });
      dropdown.appendChild(option);
    });

    DOM.api.info.appendChild(dropdown);
    State.dropdownOpen = true;
  },

  selectModel(model) {
    State.model = model;
    Utils.addLog("INFO", "APP", "Model switched", { model: model.name, provider: model.provider });
    UI.updateApiInfo("Idle");

    State.messages = [{ role: "system", content: CONFIG.SYSTEM_PROMPT }];
    DOM.chat.messages.innerHTML = "";

    UI.closeDropdown();
    Utils.addLog("INFO", "APP", "Context cleared");

    if (Settings.isOpen) Settings.render();
  },

  closeDropdown() {
    document.querySelector(".model-dropdown")?.remove();
    State.dropdownOpen = false;
  }
};
