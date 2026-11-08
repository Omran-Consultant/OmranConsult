export type LaravelErrorBody = {
  message: string;
  errors?: Record<string, string[]>;
  minutes_remaining?: number;
};

export class ApiError extends Error {
  readonly status: number;

  readonly errors?: Record<string, string[]>;

  readonly minutesRemaining?: number;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
    minutesRemaining?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.minutesRemaining = minutesRemaining;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: LaravelErrorBody | undefined;

  try {
    body = (await response.json()) as LaravelErrorBody;
  } catch {
    body = undefined;
  }

  return new ApiError(
    response.status,
    body?.message ?? response.statusText,
    body?.errors,
    body?.minutes_remaining,
  );
}
