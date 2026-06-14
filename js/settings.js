// Settings module extracted from app.js
const Settings = {
  defaults: {
    deepseek: { temperature: 1.0, max_tokens: 4096, top_p: 1.0, presence_penalty: 0, frequency_penalty: 0 },
    mimo: { temperature: 0.7, max_tokens: 4096, top_p: 1.0 },
    kimi: { temperature: 1.0, max_tokens: 32768, top_p: 0.95, presence_penalty: 0, frequency_penalty: 0 }
  },

  params: {},
  isOpen: false,

  init: function() {
    try {
      const saved = sessionStorage.getItem('dc_api_settings');
      this.params = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.defaults));
    } catch {
      this.params = JSON.parse(JSON.stringify(this.defaults));
    }
    this.bind();
  },

  get: function() {
    const provider = State.model.provider;
    return this.params[provider] || {};
  },

  buildSlider: function(key, label, value, min, max, step, desc, disabled) {
    disabled = disabled || false;
    const disAttr = disabled ? 'disabled' : '';
    const disClass = disabled ? 'setting-disabled' : '';
    return `
      <div class="setting-item ${disClass}">
        <div class="setting-label">
          <span>${label}</span>
          <span class="setting-value" id="val-${key}">${value}</span>
        </div>
        <input type="range" class="setting-slider" id="inp-${key}" 
          min="${min}" max="${max}" step="${step}" value="${value}" data-key="${key}" ${disAttr}>
        <div class="setting-desc">${desc}</div>
      </div>
    `;
  },

  buildNumber: function(key, label, value, min, max, desc, disabled) {
    disabled = disabled || false;
    const disAttr = disabled ? 'disabled' : '';
    const disClass = disabled ? 'setting-disabled' : '';
    return `
      <div class="setting-item ${disClass}">
        <div class="setting-label">
          <span>${label}</span>
          <span class="setting-value" id="val-${key}">${value}</span>
        </div>
        <input type="number" class="setting-number" id="inp-${key}" 
          min="${min}" max="${max}" value="${value}" data-key="${key}" ${disAttr}>
        <div class="setting-desc">${desc}</div>
      </div>
    `;
  },

  render: function() {
    const container = DOM.api.settingsContent;
    const provider = State.model.provider;
    const values = this.get();
    const modelLabel = State.model.label;

    DOM.api.settingsModelName.textContent = modelLabel;

    const oldHelp = DOM.api.settingsPanel.querySelector('.settings-tooltip-wrapper');
    if (oldHelp) oldHelp.remove();

    let html = '';
    if (provider === 'deepseek') {
      html += this.buildSlider('temperature', 'Temperature', values.temperature, 0, 2, 0.1, '采样温度，控制输出随机性。较高值使概率分布更平坦，生成结果更具创造性；较低值使分布更尖锐，生成结果更确定。（范围：0–2）');
      html += this.buildNumber('max_tokens', 'Max Tokens', values.max_tokens, 1, 8192, '生成 token 的上限，控制单次响应的最大长度。（范围：1–8192）');
      html += this.buildSlider('top_p', 'Top P', values.top_p, 0, 1, 0.05, '核采样（Nucleus Sampling）阈值，仅从高概率累积的 top-p 比例词汇中采样。（范围：0–1）');
      html += this.buildSlider('presence_penalty', 'Presence Penalty', values.presence_penalty, -2, 2, 0.1, '存在惩罚，对已出现过的 token 施加衰减，提升话题新颖度与主题切换概率。（范围：-2.0–2.0）');
      html += this.buildSlider('frequency_penalty', 'Frequency Penalty', values.frequency_penalty, -2, 2, 0.1, '频率惩罚，按 token 出现频次累积衰减，降低重复用词与短语循环概率。（范围：-2.0–2.0）');
    } else if (provider === 'mimo') {
      html += this.buildSlider('temperature', 'Temperature', values.temperature, 0, 2, 0.1, '采样温度，调节概率分布的熵值。高值增强创造性，低值增强一致性。（范围：0–2）');
      html += this.buildNumber('max_tokens', 'Max Tokens', values.max_tokens, 1, 32768, '最大生成 token 数，限制模型输出的总长度。（范围：1–32768）');
      html += this.buildSlider('top_p', 'Top P', values.top_p, 0, 1, 0.05, '核采样阈值，控制候选词集的累积概率质量。（范围：0–1）');
    } else if (provider === 'kimi') {
      html += this.buildSlider('temperature', 'Temperature', values.temperature, 0, 1, 0.1, '【固定值】思考模式固定 1.0，非思考模式固定 0.6。Kimi K2.6 不接受其他值。', true);
      html += this.buildNumber('max_tokens', 'Max Tokens', values.max_tokens, 1, 32768, '【可调整】生成 token 上限，默认 32768。（范围：1–32768）', false);
      html += this.buildSlider('top_p', 'Top P', values.top_p, 0, 1, 0.05, '【固定值】Kimi K2.6 强制使用 0.95，不可更改。', true);
      html += this.buildSlider('presence_penalty', 'Presence Penalty', values.presence_penalty, -2, 2, 0.1, '【固定值】Kimi K2.6 强制使用 0.0，不可更改。', true);
      html += this.buildSlider('frequency_penalty', 'Frequency Penalty', values.frequency_penalty, -2, 2, 0.1, '【固定值】Kimi K2.6 强制使用 0.0，不可更改。', true);
    }

    container.innerHTML = html;

    if (provider === 'kimi') {
      const headerEl = DOM.api.settingsPanel.querySelector('.settings-header');
      if (headerEl && !headerEl.querySelector('.settings-tooltip-wrapper')) {
        const tooltipHtml = `
          <div class="settings-tooltip-wrapper">
            <button class="settings-help-btn" aria-label="参数说明">?</button>
            <div class="settings-tooltip">
              <div class="tooltip-title">Kimi K2.6 参数约束</div>
              <div class="tooltip-body">
                <p>以下参数已由模型固定，不可调整：</p>
                <div class="tooltip-code">
                  <div class="code-line"><span class="code-key">temperature</span>: <span class="code-val">思考模式固定 1.0，非思考模式固定 0.6</span></div>
                  <div class="code-line"><span class="code-key">top_p</span>: <span class="code-val">固定 0.95</span></div>
                  <div class="code-line"><span class="code-key">n</span>: <span class="code-val">固定 1</span></div>
                  <div class="code-line"><span class="code-key">presence_penalty</span>: <span class="code-val">固定 0.0</span></div>
                  <div class="code-line"><span class="code-key">frequency_penalty</span>: <span class="code-val">固定 0.0</span></div>
                </div>
                <p class="tooltip-note">建议不要手动设置这些字段，使用默认值即可。</p>
              </div>
            </div>
          </div>
        `;
        headerEl.insertAdjacentHTML('beforeend', tooltipHtml);

        const helpBtn = headerEl.querySelector('.settings-help-btn');
        const tooltip = headerEl.querySelector('.settings-tooltip');
        if (helpBtn && tooltip) {
          helpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = tooltip.classList.contains('visible');
            document.querySelectorAll('.settings-tooltip.visible').forEach(t => t.classList.remove('visible'));
            if (!isVisible) {
              tooltip.classList.add('visible');
            }
          });
        }
      }
    }

    container.querySelectorAll('input:not([disabled])').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        const val = e.target.type === 'number' ? parseInt(e.target.value) : parseFloat(e.target.value);
        this.params[provider][key] = val;

        const display = document.getElementById(`val-${key}`);
        if (display) display.textContent = val;

        sessionStorage.setItem('dc_api_settings', JSON.stringify(this.params));
      });
    });
  },

  toggle: function() {
    const panel = DOM.api.settingsPanel;
    const logArea = DOM.api.logArea;
    const btn = DOM.api.settingsBtn;

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.render();
      panel.classList.remove('hidden');
      logArea.classList.add('hidden');
      btn.classList.add('active');
      Utils.addLog("INFO", "SETTINGS", "Panel opened", { provider: State.model.provider, params: this.get() });
    } else {
      panel.classList.add('hidden');
      logArea.classList.remove('hidden');
      btn.classList.remove('active');
      const helpBtn = panel.querySelector('.settings-tooltip-wrapper');
      if (helpBtn) helpBtn.remove();
    }
  },

  reset: function() {
    const provider = State.model.provider;
    this.params[provider] = JSON.parse(JSON.stringify(this.defaults[provider]));
    sessionStorage.setItem('dc_api_settings', JSON.stringify(this.params));
    this.render();
    Utils.addLog("INFO", "SETTINGS", "Reset to defaults", { provider });
  },

  bind: function() {
    DOM.api.settingsBtn.addEventListener('click', () => this.toggle());
    DOM.api.settingsClose.addEventListener('click', () => this.toggle());
    DOM.api.settingsReset.addEventListener('click', () => this.reset());
  }
};
