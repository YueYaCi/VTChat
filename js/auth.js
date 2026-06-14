// Auth module
let supabaseClient = null;

const Auth = {
  async init(client) {
    supabaseClient = client;
  },

  async login() {
    const { btn, error, nickname, password } = DOM.login;
    const nick = nickname.value.trim();
    const pass = password.value;

    if (!nick || !pass) {
      error.textContent = "请输入昵称和密码";
      Utils.addLog("WARN", "AUTH", "Empty credentials", { nick });
      return;
    }

    const email = CONFIG.NICKNAME_MAP[nick];
    if (!email) {
      error.textContent = "昵称不存在";
      Utils.addLog("WARN", "AUTH", "Invalid nickname", { nick });
      return;
    }

    Utils.setLoading(btn, true);
    error.textContent = "";
    Utils.addLog("INFO", "AUTH", "Signing in", { nick, email });

    try {
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (authError) throw authError;

      State.user = data.user;
      State.nickname = nick;
      State.avatar = `avatars/${nick}.png`;

      Utils.addLog("INFO", "AUTH", "Sign-in success", { userId: data.user.id, nick });
      UI.switchView('app');
      Auth.updateUI();
      await Discuss.load();
      Discuss.subscribe();
      UI.updateApiInfo("Idle");
    } catch (err) {
      error.textContent = "登录失败：" + err.message;
      Utils.addLog("ERROR", "AUTH", "Sign-in failed", { error: err.message });
    } finally {
      Utils.setLoading(btn, false);
    }
  },

  async logout() {
    Utils.addLog("INFO", "AUTH", "Signing out", { nick: State.nickname });
    await supabaseClient.auth.signOut();

    State.user = null;
    State.nickname = "";
    State.avatar = "";
    State.messages = [{ role: "system", content: CONFIG.SYSTEM_PROMPT }];
    State.apiUrl = "Loading...";

    UI.switchView('login');
    DOM.chat.messages.innerHTML = "";
    DOM.discuss.messages.innerHTML = "";
    DOM.log.innerHTML = "";
    DOM.login.nickname.value = "";
    DOM.login.password.value = "";
    DOM.login.error.textContent = "";

    Discuss.unsubscribe();
    UI.updateApiInfo("—");

    Utils.addLog("INFO", "AUTH", "Signed out, UI reset");
  },

  async restore() {
    Utils.addLog("INFO", "AUTH", "Checking session");
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
      Utils.addLog("INFO", "AUTH", "No active session");
      return;
    }

    const email = session.user.email;
    let nick = "";
    for (const [k, v] of Object.entries(CONFIG.NICKNAME_MAP)) {
      if (v === email) { nick = k; break; }
    }

    if (!nick) {
      Utils.addLog("WARN", "AUTH", "Unknown session email", { email });
      await supabaseClient.auth.signOut();
      return;
    }

    State.user = session.user;
    State.nickname = nick;
    State.avatar = `avatars/${nick}.png`;

    Utils.addLog("INFO", "AUTH", "Session restored", { nick });
    UI.switchView('app');
    Auth.updateUI();
    await Discuss.load();
    Discuss.subscribe();
    UI.updateApiInfo("Idle");
  },

  updateUI() {
    DOM.app.avatar.src = State.avatar;
    DOM.app.nickname.textContent = State.nickname;
  }
};
