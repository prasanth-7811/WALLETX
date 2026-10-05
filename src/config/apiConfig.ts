// Hardcoded project-level API credentials & environment fallbacks
export const PROJECT_CONFIG = {
  ALPHA_VANTAGE_API_KEY:
    (import.meta.env.VITE_ALPHAVANTAGE_API_KEY as string) ||
    '5067DE3NDPLWS6G6',
  FEATHERLESS_API_KEY:
    (import.meta.env.VITE_FEATHERLESS_API_KEY as string) ||
    'rc_8f711ed0563ff3dc574dd5a73e5d76909e94835f24af85b64ac2d813e3382f5e',
  DEFAULT_MODEL: 'Qwen/Qwen2.5-7B-Instruct',
  FEATHERLESS_BASE_URL: 'https://api.featherless.ai/v1/chat/completions',
};
