import type { BackendHealth } from '../types.js';

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
  }
}

export class BackendApiClient {
  constructor(private readonly baseUrl: string) {}

  async getHealth(requestId: string): Promise<BackendHealth> {
    return this.request<BackendHealth>('/health', {
      method: 'GET',
      headers: {
        'x-request-id': requestId,
      },
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const text = await response.text();
    const body = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      throw new BackendApiError(`Backend request failed for ${path}`, response.status, body);
    }

    return body as T;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
