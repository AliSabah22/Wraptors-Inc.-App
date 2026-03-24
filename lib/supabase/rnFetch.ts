/**
 * XHR-based fetch for React Native.
 *
 * React Native's global `fetch` has a bug where `Response.text()` returns
 * a Blob object instead of a string for certain responses. This causes
 * `JSON.parse("[object Object]")` → "Unexpected character: o".
 *
 * `XMLHttpRequest.responseText` always returns a proper UTF-8 string, so we
 * bypass the broken `fetch` polyfill entirely for the Supabase client.
 */
export function rnFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    const method = (init?.method ?? 'GET').toUpperCase();
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, /* async */ true);

    // Copy request headers
    const reqHeaders = init?.headers;
    if (reqHeaders) {
      const entries: [string, string][] =
        reqHeaders instanceof Headers
          ? [...reqHeaders.entries()]
          : Object.entries(reqHeaders as Record<string, string>);
      entries.forEach(([k, v]) => xhr.setRequestHeader(k, v));
    }

    xhr.onload = () => {
      // responseText is always a UTF-8 string — no Blob conversion bug
      const bodyText = xhr.responseText ?? '';

      const resHeaders = new Headers();
      xhr
        .getAllResponseHeaders()
        .split('\r\n')
        .filter(Boolean)
        .forEach((line) => {
          const idx = line.indexOf(': ');
          if (idx > 0) resHeaders.append(line.slice(0, idx), line.slice(idx + 2));
        });

      // Construct a standard Response with string body so text() works correctly
      resolve(
        new Response(bodyText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: resHeaders,
        }),
      );
    };

    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'));

    xhr.send((init?.body ?? null) as XMLHttpRequestBodyInit | null);
  });
}
