// API module
const API = {
  async init(client) {
    this.client = client;
  },

  async getToken() {
    const { data: { session } } = await this.client.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("未登录或会话已过期，请重新登录");
    return token;
  },

  async test() {
    const { testBtn, testStatus } = DOM.api;
    if (!testStatus) return;

    testBtn.disabled = true;
    testStatus.className = "api-status-message info";
    testStatus.textContent = ">> 正在测试 API 连通性...";
    testStatus.classList.remove("hidden");
    Utils.addLog("INFO", "API", "Testing connectivity");

    try {
      const token = await API.getToken();
      const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/deepseek-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hi" }],
          provider: State.model.provider,
          settings: Settings.get()
        })
      });

      const returnedUrl = response.headers.get("X-Actual-API-URL");
      if (returnedUrl) {
        State.apiUrl = returnedUrl;
        DOM.api.url.textContent = State.apiUrl;
        Utils.addLog("INFO", "API", "URL updated", { url: returnedUrl });
      }

      if (response.ok) {
        testStatus.textContent = "[OK] API 连接正常";
        testStatus.className = "api-status-message success";
        Utils.addLog("INFO", "API", "Test passed", { status: response.status });
      } else {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
    } catch (err) {
      testStatus.textContent = `[ERR] API 连接失败: ${err.message}`;
      testStatus.className = "api-status-message error";
      Utils.addLog("ERROR", "API", "Test failed", { error: err.message });
    } finally {
      testBtn.disabled = false;
      setTimeout(() => testStatus.classList.add("hidden"), 5000);
    }
  }
};
