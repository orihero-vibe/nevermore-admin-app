/**
 * Extract error message from Appwrite error
 * Simply returns the message from Appwrite as-is
 */
export const getAppwriteErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  // Handle Appwrite error objects - just get the message
  if (typeof error === 'object') {
    const appwriteError = error as {
      message?: string;
      response?: {
        message?: string;
      };
    };

    // Try to get message from various locations
    if (appwriteError.message) {
      return appwriteError.message;
    }

    if (appwriteError.response?.message) {
      return appwriteError.response.message;
    }
  }

  // Fallback for string errors
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Check if error is an unauthorized (401) error
 * These errors are often expected and should be handled silently
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const appwriteError = error as {
      code?: number;
      message?: string;
      type?: string;
      response?: { code?: number };
    };
    
    if (appwriteError.code === 401 || appwriteError.response?.code === 401) {
      return true;
    }
    
    if (appwriteError.message) {
      return (
        appwriteError.message.includes('401') ||
        appwriteError.message.includes('Unauthorized') ||
        appwriteError.message.includes('missing scopes')
      );
    }
  }
  return false;
};

