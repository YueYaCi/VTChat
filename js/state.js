// Shared application state
const State = {
  user: null,
  nickname: "",
  avatar: "",
  apiUrl: "Loading...",
  model: CONFIG.MODELS[0],
  dropdownOpen: false,
  messages: [{ role: "system", content: CONFIG.SYSTEM_PROMPT }],
  channel: null,
  isChatSending: false,
  isDiscussSending: false
};
