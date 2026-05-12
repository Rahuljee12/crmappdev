import { log } from '@/core/utils/logger';

export type HttpJsonError = {
  name: 'HttpJsonError';
  status: number;
  message: string;
  url: string;
  bodyText?: string;
};

async function safeReadText(res: Response) {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

export async function httpJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const url =
      typeof input === 'string'
        ? input
        : undefined;

    log.debug('[httpJson] request', {
      url,
      method: init?.method,
      hasBody: Boolean(init?.body),
    });

    let res: Response;
    try {
      res = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (err: any) {
      log.error('[httpJson] fetch failed', {
        url,
        method: init?.method,
        error: err,
        name: err?.name,
        message: err?.message,
      });
      throw err;
    }

    const text = await res.text();


    // Log via logger (not console) so it appears in Android logcat reliably
    log.error('[httpJson] raw response', {
      url,
      method: init?.method,
      status: res.status,
      ok: res.ok,
      bodyText: text,
    });

    if (!res.ok) {
      throw {
        status: res.status,
        body: text,
      };
    }


    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timeout);
  }
}