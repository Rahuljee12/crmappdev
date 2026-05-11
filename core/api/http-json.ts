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
  const res = await fetch(input, init);
  if (!res.ok) {
    const bodyText = await safeReadText(res);
    const err: HttpJsonError = {
      name: 'HttpJsonError',
      status: res.status,
      message: `Request failed with ${res.status}`,
      url: typeof input === 'string' ? input : res.url,
      bodyText,
    };
    throw err;
  }

  return (await res.json()) as T;
}

