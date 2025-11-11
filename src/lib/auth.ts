import { account } from "./appwrite";
import type { Models } from "appwrite";
import type { User } from "../types";
import { showAppwriteError } from "./notifications";
import { isUnauthorizedError } from "./errorHandler";

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<Models.Session> => {
  try {
    const session = await account.createEmailPasswordSession({email, password});
    return session;
  } catch (error: unknown) {
    // Don't show notification for invalid credentials (401) - we'll show it in the form
    // But show notifications for other errors
    const isInvalidCredentials = isUnauthorizedError(error);
    if (!isInvalidCredentials) {
      showAppwriteError(error, { skipUnauthorized: true });
    }
    
    // Just throw the error as-is - Appwrite error will be displayed directly
    throw error;
  }
};

/**
 * Get current user session
 */
export const getCurrentSession = async (): Promise<Models.Session | null> => {
  try {
    const session = await account.getSession({sessionId: "current"});
    return session;
  } catch (error: unknown) {
    // 401 Unauthorized is expected when user is not authenticated (guest user)
    // This is not an error condition, just means no active session exists
    if (isUnauthorizedError(error)) {
      // No session exists - this is normal for unauthenticated users
      return null;
    }
    // Show notification for unexpected errors
    showAppwriteError(error, { skipUnauthorized: true });
    console.error("Error getting current session:", error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser =
  async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      const user = await account.get();
      return user;
    } catch (error: unknown) {
      // 401 Unauthorized is expected when user is not authenticated (guest user)
      // This is not an error condition, just means no active session exists
      if (isUnauthorizedError(error)) {
        // No user session - this is normal for unauthenticated users
        return null;
      }
      // Show notification for unexpected errors
      showAppwriteError(error, { skipUnauthorized: true });
      console.error("Error getting current user:", error);
      return null;
    }
  };

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await account.deleteSession({sessionId: "current"});
  } catch (error: unknown) {
    // If user is already signed out (401), that's fine - don't show error
    // For other errors, log them but don't show notification (user action is already handled)
    if (isUnauthorizedError(error)) {
      // User is already signed out - this is expected and not an error
      return;
    }
    // Log other errors but don't show notification (sign out should still proceed)
    console.error("Error signing out:", error);
    // Don't throw - we want to clear local state even if server sign out fails
  }
};

/**
 * Create password recovery (sends recovery email)
 */
export const createPasswordRecovery = async (
  email: string,
  url?: string
): Promise<void> => {
  try {
    // If no URL is provided, construct the default recovery URL
    // Appwrite will append userId and secret as query parameters
    const recoveryUrl = url || `${window.location.origin}/create-new-password`;
    await account.createRecovery({
      email,
      url: recoveryUrl,
    });
  } catch (error: unknown) {
    // Show notification for recovery errors
    showAppwriteError(error, { skipUnauthorized: true });
    // Just throw the error as-is
    throw error;
  }
};

/**
 * Update password using recovery (userId and secret from recovery link)
 */
export const updatePasswordRecovery = async (
  userId: string,
  secret: string,
  password: string
): Promise<void> => {
  try {
    await account.updateRecovery({
      userId,
      secret,
      password,
    });
  } catch (error: unknown) {
    // Show notification for password update errors
    showAppwriteError(error, { skipUnauthorized: true });
    // Just throw the error as-is
    throw error;
  }
};

/**
 * Convert Appwrite User to our User type
 */
export const mapAppwriteUserToUser = (
  appwriteUser: Models.User<Models.Preferences>
): User => {
  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name || appwriteUser.email,
    role: (appwriteUser.prefs as Models.Preferences & { role?: string })?.role || "user",
    createdAt: appwriteUser.$createdAt,
  };
};
