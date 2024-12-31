import { log } from "./log";

type ErrorResponse = {
  message: string;
  code?: number;
  details?: unknown;
};

type ErrorHandlerOptions = {
  message?: string;
  logToConsole?: boolean;
  path?: string;
};

export class AppError extends Error {
  code: number;
  details?: unknown;

  constructor(message: string, code: number = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export function handleError<T>(
  asyncFn: Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<[T | null, ErrorResponse | null]> {
  const {
    message = "An unexpected error occurred",
    logToConsole = true,
    path = "unknown",
  } = options;

  return asyncFn
    .then((result) => {
      return [result, null] as [T, null];
    })
    .catch((error: any) => {
      if (logToConsole) {
        log.error(` Error at ${path}: ${error.message}`);
      }

      let errorResponse: ErrorResponse;

      if (error instanceof AppError) {
        errorResponse = {
          message: error.message,
          code: error.code,
          details: error.details,
        };
      } else if (error instanceof Error) {
        errorResponse = {
          message: error.message,
          code: 500,
        };
      } else {
        errorResponse = {
          message,
          code: 500,
          details: error,
        };
      }

      return [null, errorResponse] as [null, ErrorResponse];
    });
}
