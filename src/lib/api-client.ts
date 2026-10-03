import { ofetch } from "ofetch";
import type { ApiErrorBody, ApiMeta, ApiResponse } from "@/types";
import { ApiError, toApiError } from "./api-error";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./session";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** `undefined` and `""` are dropped so a cleared filter leaves the URL alone. */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

const toSearchParams = (query?: QueryParams) => {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = String(value);
  }
  return Object.keys(params).length ? params : undefined;
};

/**
 * A request that never answers is worse than one that fails.
 *
 * Without this, a connection that hangs — a flaky network, an API that is up but
 * unreachable — leaves every caller waiting forever: the sign-in button spins
 * with no error, and the header sits on a skeleton rather than offering a way
 * out. A bounded wait turns all of that back into an ordinary error the UI
 * already knows how to show. Thirty seconds is generous enough for a cold start
 * on a serverless function and a slow upload, and short enough that nobody
 * concludes the app is broken.
 */
const REQUEST_TIMEOUT_MS = 30_000;

const raw = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Refreshing is single-flight. Ten queries can fail their 401 in the same tick;
 * without this they would each burn a refresh token and the rotation check
 * server-side would read the reuse as a stolen token and revoke the session.
 */
let refreshInFlight: Promise<string> | null = null;

const refreshTokens = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "Session expired");

  const body = await raw<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh-token", { method: "POST", body: { refreshToken } });

  saveSession(body.data);
  return body.data.accessToken;
};

const runRefresh = () => {
  refreshInFlight ??= refreshTokens().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  /** Skips both the Authorization header and the refresh retry. */
  anonymous?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const isAuthFailure = (error: unknown) => {
  const api = toApiError(error);
  return (
    api.status === 401 &&
    !api.hasCode("ACCOUNT_BLOCKED") &&
    !api.hasCode("INVALID_CREDENTIALS")
  );
};

const send = async <T>(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = { ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return raw<ApiResponse<T>>(path, {
    method: options.method ?? "GET",
    // FormData has to keep its own multipart boundary, so it goes through as is.
    body: options.body as never,
    query: toSearchParams(options.query),
    headers,
    signal: options.signal,
  });
};

const sendBlob = (path: string, accessToken: string | null): Promise<Blob> =>
  // The second type argument is ofetch's response kind; it defaults to "json",
  // which would contradict the option below.
  raw<Blob, "blob">(path, {
    responseType: "blob",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

/**
 * A failed blob request carries its JSON body as a Blob, which `toApiError`
 * cannot read — so it is turned back into text first. Without this a 409 with a
 * perfectly good explanation would surface as "Something went wrong".
 */
const blobError = async (error: unknown): Promise<ApiError> => {
  const response = (
    error as { response?: { status?: number; _data?: unknown } }
  )?.response;
  const data = response?._data;

  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text()) as ApiErrorBody;
      return new ApiError(
        response?.status ?? 500,
        body.message ?? "Something went wrong",
        body.errors ?? [],
        body.requestId,
      );
    } catch {
      // Not JSON after all — fall through to the generic mapping.
    }
  }

  return toApiError(error);
};

/**
 * For an endpoint that answers a file rather than an envelope.
 *
 * Separate from `apiRequest` because that one reaches into `.data`, which a PDF
 * has none of. The 401-refresh-retry is the same, so a download never fails just
 * because the access token expired while the page was open.
 */
export const apiBlob = async (path: string): Promise<Blob> => {
  try {
    return await sendBlob(path, getAccessToken());
  } catch (error) {
    if (!isAuthFailure(error)) throw await blobError(error);

    try {
      return await sendBlob(path, await runRefresh());
    } catch (refreshError) {
      clearSession();
      throw toApiError(refreshError);
    }
  }
};

/**
 * The single door to the API. Returns the whole envelope, because list
 * endpoints put their counters in `meta` and callers need both halves.
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const token = options.anonymous ? null : getAccessToken();

  try {
    return await send<T>(path, options, token);
  } catch (error) {
    if (options.anonymous || !isAuthFailure(error)) throw toApiError(error);

    // One retry, and only after a refresh actually produced a new token.
    try {
      const fresh = await runRefresh();
      return await send<T>(path, options, fresh);
    } catch (refreshError) {
      clearSession();
      throw toApiError(refreshError);
    }
  }
};

/** For the common case where only `data` matters. */
export const api = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => (await apiRequest<T>(path, options)).data;

/** For list endpoints: rows and counters, already separated. */
export const apiList = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ items: T[]; meta: ApiMeta }> => {
  const response = await apiRequest<T[] | { items: T[] }>(path, options);
  const data = response.data;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return { items, meta: response.meta ?? {} };
};

export { BASE_URL };
