// Discuss module
const Discuss = {
  async load() {
    if (!State.user) return;
    Utils.addLog("INFO", "DISCUSS", "Loading messages");

    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      Utils.addLog("ERROR", "DB", "Load failed", { error: error.message });
      return;
    }

    DOM.discuss.messages.innerHTML = "";
    data.forEach(msg => UI.appendDiscussMessage(msg, msg.user_id === State.user.id));

    Utils.addLog("INFO", "DISCUSS", "Messages loaded", { count: data.length });
  },

  async send() {
    const { input, send: btn } = DOM.discuss;
    const content = input.value.trim();
    if (!content || !State.user || State.isDiscussSending) return;

    State.isDiscussSending = true;
    btn.disabled = true;

    const preview = content.slice(0, 50);
    Utils.addLog("INFO", "DISCUSS", "Sending message", { length: content.length, preview });

    const tempMsg = {
      id: `temp-${Date.now()}`,
      user_id: State.user.id,
      nickname: State.nickname,
      content: content,
      created_at: new Date().toISOString()
    };
    UI.appendDiscussMessage(tempMsg, true);

    try {
      const { error } = await supabaseClient
        .from("messages")
        .insert([{ user_id: State.user.id, nickname: State.nickname, content }]);

      if (error) throw error;

      Utils.addLog("INFO", "DISCUSS", "Message sent", { preview });
      input.value = "";
      Utils.autoResize(input);
    } catch (err) {
      Utils.addLog("ERROR", "DB", "Insert failed", { error: err.message });
      const tempEl = DOM.discuss.messages.querySelector(`[data-msg-id="${tempMsg.id}"]`);
      if (tempEl) tempEl.classList.add('failed');
    } finally {
      State.isDiscussSending = false;
      btn.disabled = false;
    }
  },

  subscribe() {
    Discuss.unsubscribe();

    State.channel = supabaseClient
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.user_id === State.user?.id) return;
        UI.appendDiscussMessage(payload.new, false);
        Utils.addLog("INFO", "DISCUSS", "Realtime message received", { from: payload.new.nickname });
      })
      .subscribe();

    Utils.addLog("INFO", "DISCUSS", "Realtime subscribed");
  },

  unsubscribe() {
    if (State.channel) {
      supabaseClient.removeChannel(State.channel);
      State.channel = null;
      Utils.addLog("INFO", "DISCUSS", "Realtime unsubscribed");
    }
  }
};
