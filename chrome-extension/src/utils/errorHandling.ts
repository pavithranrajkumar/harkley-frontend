import { RecordingError } from '../types';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants';

export class ExtensionError extends Error {
  constructor(message: string, public code: string, public recoverable: boolean = false) {
    super(message);
    this.name = 'ExtensionError';
  }
}

export const createRecordingError = (error: unknown): RecordingError => {
  if (error instanceof ExtensionError) {
    return {
      message: error.message,
      code: error.code,
      recoverable: error.recoverable,
    };
  }

  if (error instanceof Error) {
    // Map common browser errors to our error codes
    let code: string = ERROR_CODES.UNKNOWN_ERROR;
    let recoverable = false;

    if (error.name === 'NotAllowedError') {
      code = ERROR_CODES.PERMISSION_DENIED;
      recoverable = true;
    } else if (error.name === 'NotSupportedError') {
      code = ERROR_CODES.NOT_SUPPORTED;
      recoverable = false;
    } else if (error.name === 'NotFoundError') {
      code = ERROR_CODES.NOT_FOUND;
      recoverable = true;
    }

    return {
      message: (ERROR_MESSAGES as Record<string, string>)[code] || error.message,
      code,
      recoverable,
    };
  }

  return {
    message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    code: ERROR_CODES.UNKNOWN_ERROR,
    recoverable: false,
  };
};

export const logError = (context: string, error: unknown): void => {
  const recordingError = createRecordingError(error);
  console.error(`[${context}] Error:`, {
    message: recordingError.message,
    code: recordingError.code,
    recoverable: recordingError.recoverable,
    originalError: error,
  });
};

export const handleAsyncError = async <T>(operation: () => Promise<T>, context: string): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logError(context, error);
    throw createRecordingError(error);
  }
};
