// Links module
const Links = {
  data: [
    { name: "VTChat 仓库", url: "https://github.com/YueYaCi/VTChat" },
    { name: "Supabase", url: "https://supabase.com" },
    { name: "DeepSeek", url: "https://www.deepseek.com/" },
    { name: "DeepSeek Status", url: "https://status.deepseek.com/" },
    { name: "=========", url: "https://www.taptap.cn/app/782330" },
    { name: "桌游", url: "https://game.hullqin.cn/" },
    { name: "bilibili", url: "https://www.bilibili.com/" }
  ],

  open() {
    const existing = document.querySelector('.links-modal-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.className = 'links-modal-overlay';

    const itemsHtml = this.data.map(item => `
      <div class="link-item">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>
        <span class="link-url">${item.url}</span>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="links-modal">
        <div class="links-modal-header">
          <h4>常用网址</h4>
          <button class="links-modal-close" aria-label="关闭">✕</button>
        </div>
        <div class="links-modal-body">
          ${itemsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.links-modal-close');
    closeBtn.addEventListener('click', () => this.close());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  close() {
    const overlay = document.querySelector('.links-modal-overlay');
    if (overlay) {
      overlay.remove();
      document.removeEventListener('keydown', this._escHandler);
    }
  }
};
