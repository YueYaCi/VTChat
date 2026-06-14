// Bootstrapper: initialize supabase client and wire modules
let supabaseClient = null;

const App = {
  init() {
    const supabaseClientLocal = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    supabaseClient = supabaseClientLocal;
    Auth.init(supabaseClientLocal);
    API.init(supabaseClientLocal);
    // keep global for backward compatibility
    window.supabaseClient = supabaseClientLocal;

    Events.bind();
    if (DOM.discuss && DOM.discuss.linksBtn) {
      DOM.discuss.linksBtn.addEventListener('click', () => Links.open());
    }
    Settings.init();
    Auth.restore();
    Utils.addLog("INFO", "APP", "Application initialized");
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
