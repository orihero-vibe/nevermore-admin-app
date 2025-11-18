import { databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { showAppwriteError, showSuccess } from './notifications';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const SETTINGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SETTINGS_COLLECTION_ID || 'settings';

export interface SettingDocument {
  $id: string;
  key: string; // 'terms' or 'privacy'
  value: string; // Markdown content
  $createdAt?: string;
  $updatedAt?: string;
}

/**
 * Get a setting by key (terms or privacy)
 */
export async function getSetting(key: 'terms' | 'privacy'): Promise<SettingDocument | null> {
  if (!DATABASE_ID) {
    const error = new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  if (!SETTINGS_COLLECTION_ID) {
    const error = new Error(
      'VITE_APPWRITE_SETTINGS_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SETTINGS_COLLECTION_ID,
      [Query.equal('key', key), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as unknown as SettingDocument;
  } catch (error) {
    console.error('Error fetching setting:', error);
    showAppwriteError(error);
    throw error;
  }
}

/**
 * Create or update a setting
 */
export async function saveSetting(key: 'terms' | 'privacy', value: string): Promise<string> {
  if (!DATABASE_ID) {
    const error = new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  if (!SETTINGS_COLLECTION_ID) {
    const error = new Error(
      'VITE_APPWRITE_SETTINGS_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  try {
    // Check if setting already exists
    const existing = await getSetting(key);

    if (existing) {
      // Update existing setting
      const response = await databases.updateDocument(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        existing.$id,
        {
          value: value,
        }
      );

      showSuccess(`${key === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'} updated successfully`);
      return response.$id;
    } else {
      // Create new setting
      const response = await databases.createDocument(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        ID.unique(),
        {
          key: key,
          value: value,
        }
      );

      showSuccess(`${key === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'} created successfully`);
      return response.$id;
    }
  } catch (error) {
    console.error('Error saving setting:', error);
    showAppwriteError(error);
    throw error;
  }
}

