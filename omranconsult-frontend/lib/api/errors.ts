export type LaravelErrorBody = {
  message: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;

  readonly errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
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
  );
}
