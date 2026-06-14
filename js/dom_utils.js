// DOM cache and utility functions
const DOM = (() => {
  const $ = (id) => document.getElementById(id);
  return {
    login: {
      container: $("login-container"),
      btn: $("login-btn"),
      error: $("login-error"),
      nickname: $("nickname-input"),
      password: $("password-input")
    },
    app: {
      container: $("app-container"),
      avatar: $("avatar-small"),
      nickname: $("nickname-display"),
      logout: $("logout-btn")
    },
    chat: {
      messages: $("chat-messages"),
      input: $("user-input"),
      send: $("send-btn")
    },
    discuss: {
      messages: $("discussion-messages"),
      input: $("discussion-input"),
      send: $("send-discussion-btn"),
      linksBtn: $("links-btn")
    },
    api: {
      model: $("api-model"),
      url: $("api-url"),
      rounds: $("api-rounds"),
      lastTime: $("api-last-time"),
      status: $("api-status"),
      respLen: $("api-resp-len"),
      testBtn: $("api-test-btn"),
      testStatus: $("api-test-status"),
      modelBtn: $("model-select-btn"),
      info: $("api-info"),
      settingsBtn: $("api-settings-btn"),
      settingsPanel: $("api-settings-panel"),
      settingsClose: $("settings-close-btn"),
      settingsReset: $("settings-reset-btn"),
      settingsContent: $("settings-content"),
      settingsModelName: $("settings-model-name"),
      logArea: $("log-area")
    },
    log: $("log-content")
  };
})();

const Utils = {
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<<>\"']/g, m => map[m]);
  },

  autoResize(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = parseInt(getComputedStyle(textarea).maxHeight) || 150;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  },

  formatTime(date) {
    return new Date(date).toLocaleString("zh-CN", { hour12: false });
  },

  setLoading(btn, isLoading) {
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    if (text) text.classList.toggle('hidden', isLoading);
    if (loader) loader.classList.toggle('hidden', !isLoading);
    btn.disabled = isLoading;
  },

  addLog(level, component, message, details = {}) {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8) + "." + String(now.getMilliseconds()).padStart(3, "0");
    const detailStr = Object.entries(details).map(([k, v]) => `${k}=${v}`).join(" ");
    const line = `${timeStr} ${level.padEnd(5)} [${component.padEnd(7)}] ${message}${detailStr ? " — " + detailStr : ""}`;

    if (DOM.log) {
      const entry = document.createElement("div");
      entry.className = `log-entry ${level.toLowerCase()}`;
      entry.textContent = line;
      DOM.log.appendChild(entry);
      DOM.log.scrollTop = DOM.log.scrollHeight;
    }

    const consoleMsg = { time: now.toISOString(), level, component, message, details };
    const fn = { ERROR: console.error, WARN: console.warn, DEBUG: console.debug }[level] || console.info;
    fn(consoleMsg);
  },

  highlightCode(code, lang) {
    let html = Utils.escapeHtml(code);
    if (!lang || lang === 'text') return html;

    const ph = [];
    const stash = (str, type) => {
      const key = `__X${Math.random().toString(36).slice(2, 8)}${ph.length}__`;
      ph.push({ key, text: str, type });
      return key;
    };
    const wrap = (text, cls) => `<span class="hl-${cls}">${text}</span>`;

    if (lang === 'python' || lang === 'py') {
      html = html.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, m => stash(m, 'string'));
      html = html.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => stash(m, 'string'));
      html = html.replace(/(#.*$)/gm, m => stash(m, 'comment'));
      html = html.replace(/\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|True|False|None|and|or|not|in|is|lambda|yield|raise|break|continue|pass|global|nonlocal|assert|del|async|await)\b/g, m => wrap(m, 'keyword'));
      html = html.replace(/\b(\d+\.?\d*)\b/g, m => wrap(m, 'number'));
      html = html.replace(/\b([A-Za-z_]\w*)\s*(?=\()/g, m => wrap(m.slice(0, -1), 'function') + ' ');
    } else if (['javascript', 'js', 'typescript', 'ts', 'json'].includes(lang)) {
      html = html.replace(/(\/\/.*$)/gm, m => stash(m, 'comment'));
      html = html.replace(/(\/\*[\s\S]*?\*\/) /g, m => stash(m, 'comment'));
      html = html.replace(/(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, m => stash(m, 'string'));
      html = html.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|new|this|typeof|instanceof|in|of|void|delete|true|false|null|undefined|async|await|class|extends|export|import|from|yield|static|get|set)\b/g, m => wrap(m, 'keyword'));
      html = html.replace(/\b(\d+\.?\d*)\b/g, m => wrap(m, 'number'));
      html = html.replace(/\b([A-Za-z_]\w*)\s*(?=\()/g, m => wrap(m.slice(0, -1), 'function') + ' ');
    }

    ph.forEach(({ key, text, type }) => {
      html = html.split(key).join(wrap(text, type));
    });
    return html;
  },

  formatContent(text) {
    if (!text) return '';
    const blocks = [];
    let idx = 0;

    const replaced = text.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${idx++}_${Math.random().toString(36).slice(2)}__`;
      blocks.push({ placeholder, lang, rawCode: code });
      return placeholder;
    });

    let html = Utils.escapeHtml(replaced);

    blocks.forEach(({ placeholder, lang, rawCode }) => {
      const highlighted = Utils.highlightCode(rawCode, lang);
      const blockHtml = `
        <div class="code-block-outer">
          <div class="code-block-header">
            <span class="code-lang">${lang || 'text'}</span>
            <button class="code-copy-btn" data-code="${Utils.escapeHtml(rawCode)}" title="复制代码" aria-label="复制代码">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="copy-label">复制</span>
            </button>
          </div>
          <pre class="code-block-wrapper"><code class="code-block language-${lang}">${highlighted}</code></pre>
        </div>
      `;
      html = html.split(placeholder).join(blockHtml);
    });

    html = html.replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>');
    return html;
  }
};
