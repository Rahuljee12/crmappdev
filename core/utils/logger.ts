type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function enabled() {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : true;
}

export const log = {
  debug: (...args: unknown[]) => {
    if (!enabled()) return;
    console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (!enabled()) return;
    console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (!enabled()) return;
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (!enabled()) return;
    //console.error('[ERROR]', ...args);
  },
} satisfies Record<LogLevel, (...args: unknown[]) => void>;

