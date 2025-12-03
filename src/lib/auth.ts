import { account, tablesDB } from "./appwrite";
import { Query } from "appwrite";
import type { Models } from "appwrite";
import type { User } from "../types";
import { showAppwriteError } from "./notifications";
import { isUnauthorizedError } from "./errorHandler";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const USER_PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID || 'user_profiles';

interface UserProfile {
  $id: string;
  type: string;
  auth_id: string;
  [key: string]: unknown;
}

/**
 * Get user profile from user_profiles collection by auth_id
 */
const getUserProfile = async (authId: string): Promise<UserProfile | null> => {
  if (!DATABASE_ID || !USER_PROFILES_COLLECTION_ID) {
    console.error('Database ID or User Profiles Collection ID not configured');
    return null;
  }

  try {
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_COLLECTION_ID,
      queries: [
        Query.equal('auth_id', authId),
      ],
    });

    if (response.rows && response.rows.length > 0) {
      return response.rows[0] as unknown as UserProfile;
    }
    return null;
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Check if user is a coach
 */
const isCoach = async (authId: string): Promise<boolean> => {
  const profile = await getUserProfile(authId);
  return profile?.type === 'coach';
};

/**
 * Sign in with email and password
 * Only allows login if user type is 'coach'
 */
export const signIn = async (
  email: string,
  password: string
): Promise<Models.Session> => {
  try {
    const session = await account.createEmailPasswordSession({email, password});
    
    // After successful login, verify user is a coach
    const appwriteUser = await account.get();
    if (appwriteUser) {
      const userIsCoach = await isCoach(appwriteUser.$id);
      
      if (!userIsCoach) {
        // User is not a coach - sign them out and throw error
        try {
          await account.deleteSession({sessionId: "current"});
        } catch {
          // Ignore sign out errors
        }
        throw new Error('Access denied. Only coaches can access the admin panel.');
      }
    }
    
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
 * Also validates that user is a coach
 */
export const getCurrentUser =
  async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      const user = await account.get();
      
      // Validate user is a coach
      if (user) {
        const userIsCoach = await isCoach(user.$id);
        if (!userIsCoach) {
          // User is not a coach - sign them out
          try {
            await account.deleteSession({sessionId: "current"});
          } catch {
            // Ignore sign out errors
          }
          return null;
        }
      }
      
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
 * Update user email
 */
export const updateEmail = async (
  email: string,
  password: string
): Promise<Models.User<Models.Preferences>> => {
  try {
    const user = await account.updateEmail({
      email,
      password,
    });
    return user;
  } catch (error: unknown) {
    showAppwriteError(error, { skipUnauthorized: true });
    throw error;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  password: string,
  oldPassword: string
): Promise<Models.User<Models.Preferences>> => {
  try {
    const user = await account.updatePassword({
      password,
      oldPassword,
    });
    return user;
  } catch (error: unknown) {
    showAppwriteError(error, { skipUnauthorized: true });
    throw error;
  }
};

/**
 * Update user phone number
 * Password is required for security verification
 */
export const updatePhone = async (
  phone: string,
  password: string
): Promise<Models.User<Models.Preferences>> => {
  try {
    const user = await account.updatePhone({
      phone,
      password,
    });
    return user;
  } catch (error: unknown) {
    showAppwriteError(error, { skipUnauthorized: true });
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
