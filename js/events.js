// Events binding
const Events = {
  bind() {
    DOM.login.btn.addEventListener("click", Auth.login);
    DOM.login.nickname.addEventListener("keydown", (e) => {
      if (e.key === "Enter") Auth.login();
    });
    DOM.login.password.addEventListener("keydown", (e) => {
      if (e.key === "Enter") Auth.login();
    });

    DOM.app.logout.addEventListener("click", Auth.logout);

    DOM.chat.send.addEventListener("click", Chat.send);
    DOM.chat.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        Chat.send();
      }
    });
    DOM.chat.input.addEventListener("input", () => Utils.autoResize(DOM.chat.input));

    DOM.discuss.send.addEventListener("click", Discuss.send);
    DOM.discuss.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        Discuss.send();
      }
    });
    DOM.discuss.input.addEventListener("input", () => Utils.autoResize(DOM.discuss.input));

    DOM.api.modelBtn.addEventListener("click", UI.toggleModelDropdown);
    DOM.api.testBtn.addEventListener("click", API.test);

    document.addEventListener("click", (e) => {
      if (State.dropdownOpen && !e.target.closest("#api-info")) {
        UI.closeDropdown();
      }
      if (!e.target.closest('.settings-tooltip-wrapper')) {
        document.querySelectorAll('.settings-tooltip.visible').forEach(t => t.classList.remove('visible'));
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && State.dropdownOpen) {
        UI.closeDropdown();
      }
      if (e.key === "Escape" && Settings.isOpen) {
        Settings.toggle();
      }
    });

    DOM.chat.messages.addEventListener('click', (e) => {
      const btn = e.target.closest('.code-copy-btn');
      if (!btn) return;
      const code = btn.dataset.code || '';
      navigator.clipboard.writeText(code).then(() => {
        const label = btn.querySelector('.copy-label');
        if (!label) return;
        const original = label.textContent;
        label.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          label.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        Utils.addLog("ERROR", "UI", "Copy failed", { error: err.message });
      });
    });
  }
};
