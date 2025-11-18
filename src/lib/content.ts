import { storage, databases } from './appwrite';
import { ID, Query } from 'appwrite';
import { showAppwriteError, showSuccess } from './notifications';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const CONTENT_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CONTENT_COLLECTION_ID || 'content';
const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || '';

export interface ContentData {
  title: string;
  category?: string; // Category ID (relationship - Many to one)
  role?: string; // Enum: support, recovery
  type: string; // Enum: required field
  images?: string[]; // Array of URLs
  files?: string[]; // Array of URLs (for audio files)
  transcript?: string; // Single URL
  tasks?: string[]; // Array of strings (for 40 Day Journey)
}

export interface UploadedFile {
  fileId: string;
  url: string;
}

/**
 * Upload a single file to Appwrite Storage
 */
export async function uploadFile(
  file: File,
  bucketId: string = STORAGE_BUCKET_ID
): Promise<UploadedFile> {
  if (!bucketId) {
    throw new Error(
      'VITE_APPWRITE_STORAGE_BUCKET_ID is not set in environment variables. Please add it to your .env file.'
    );
  }

  try {
    // Create a unique file ID
    const fileId = ID.unique();
    
    // Upload file to storage
    const response = await storage.createFile(bucketId, fileId, file);
    
    // Get the file URL using Appwrite Storage API
    // getFileView returns a URL string that can be used to view the file
    const fileUrl = storage.getFileView(bucketId, response.$id);
    
    return {
      fileId: response.$id,
      url: fileUrl.toString(),
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    showAppwriteError(error);
    throw error;
  }
}

/**
 * Upload multiple files to Appwrite Storage
 */
export async function uploadFiles(
  files: File[],
  bucketId: string = STORAGE_BUCKET_ID
): Promise<UploadedFile[]> {
  if (files.length === 0) {
    return [];
  }

  // Upload all files in parallel
  const uploadPromises = files.map((file) => uploadFile(file, bucketId));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}

/**
 * Create content document in Appwrite Database
 */
export async function createContent(contentData: ContentData): Promise<string> {
  // Validate environment variables
  if (!DATABASE_ID) {
    const error = new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  if (!CONTENT_COLLECTION_ID) {
    const error = new Error(
      'VITE_APPWRITE_CONTENT_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  try {
    // Validate required fields
    if (!contentData.type) {
      throw new Error('Content type is required');
    }

    // Prepare the document data
    const documentData: Record<string, unknown> = {
      title: contentData.title,
      type: contentData.type, // Required field
    };

    // Add optional fields if they exist
    if (contentData.category) {
      documentData.category = contentData.category; // Category ID for relationship
    }

    if (contentData.role) {
      documentData.role = contentData.role;
    }

    if (contentData.images && contentData.images.length > 0) {
      documentData.images = contentData.images;
    }

    if (contentData.files && contentData.files.length > 0) {
      documentData.files = contentData.files;
    }

    if (contentData.tasks && contentData.tasks.length > 0) {
      documentData.tasks = contentData.tasks;
    }

    if (contentData.transcript) {
      documentData.transcript = contentData.transcript;
    }

    // Create the document
    const response = await databases.createDocument(
      DATABASE_ID,
      CONTENT_COLLECTION_ID,
      ID.unique(),
      documentData
    );

    console.log('Content created successfully:', response.$id);
    return response.$id;
  } catch (error) {
    console.error('Error creating content:', error);
    showAppwriteError(error);
    throw error;
  }
}

/**
 * Upload files and create content in one operation
 */
export async function publishContent(
  contentData: ContentData,
  imageFiles: File[],
  audioFiles: File[],
  transcriptFile: File | null,
  tasks?: string[],
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    let progress = 0;
    const totalSteps = 
      (imageFiles.length > 0 ? 1 : 0) +
      (audioFiles.length > 0 ? 1 : 0) +
      (transcriptFile ? 1 : 0) +
      1; // +1 for creating content
    let currentStep = 0;

    // Upload images
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
      const uploadedImages = await uploadFiles(imageFiles);
      imageUrls = uploadedImages.map((file) => file.url);
      currentStep++;
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
    }

    // Upload audio files
    let audioUrls: string[] = [];
    if (audioFiles.length > 0) {
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
      const uploadedAudio = await uploadFiles(audioFiles);
      audioUrls = uploadedAudio.map((file) => file.url);
      currentStep++;
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
    }

    // Upload transcript
    let transcriptUrl: string | undefined;
    if (transcriptFile) {
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
      const uploadedTranscript = await uploadFile(transcriptFile);
      transcriptUrl = uploadedTranscript.url;
      currentStep++;
      onProgress?.(Math.round((currentStep / totalSteps) * 100));
    }

    // Create content document
    onProgress?.(Math.round((currentStep / totalSteps) * 100));
    const contentId = await createContent({
      ...contentData,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      files: audioUrls.length > 0 ? audioUrls : undefined, // Store audio files in 'files' array
      transcript: transcriptUrl,
      tasks: tasks && tasks.length > 0 ? tasks : undefined,
    });
    currentStep++;
    onProgress?.(100);

    showSuccess('Content published successfully!');
    return contentId;
  } catch (error) {
    console.error('Error publishing content:', error);
    throw error;
  }
}

/**
 * Content document from Appwrite
 */
export interface ContentDocument {
  $id: string;
  title: string;
  category?: string; // Category ID (relationship)
  role?: string; // Enum: support, recovery, prevention
  type: string; // Enum: forty_day_journey, forty_temptations
  images?: string[];
  files?: string[]; // Audio files URLs
  transcript?: string;
  tasks?: string[];
  $createdAt?: string;
  $updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Fetch all content documents from Appwrite
 */
export async function fetchContent(
  limit?: number,
  offset?: number,
  searchQuery?: string,
  filters?: {
    category?: string;
    role?: string;
    type?: string;
  }
): Promise<{ documents: ContentDocument[]; total: number }> {
  // Validate environment variables
  if (!DATABASE_ID) {
    const error = new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  if (!CONTENT_COLLECTION_ID) {
    const error = new Error(
      'VITE_APPWRITE_CONTENT_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  try {
    const queries: string[] = [];

    // Add pagination queries
    if (limit !== undefined) {
      queries.push(Query.limit(limit));
    }
    if (offset !== undefined) {
      queries.push(Query.offset(offset));
    }

    // Add search query if provided
    if (searchQuery && searchQuery.trim()) {
      queries.push(Query.search('title', searchQuery.trim()));
    }

    // Add filters
    if (filters?.category) {
      queries.push(Query.equal('category', filters.category));
    }
    if (filters?.role) {
      queries.push(Query.equal('role', filters.role));
    }
    if (filters?.type) {
      // Map display type to database type
      const typeMap: Record<string, string> = {
        '40-temptations': 'forty_temptations',
        '40-day-journey': 'forty_day_journey',
      };
      const dbType = typeMap[filters.type] || filters.type;
      queries.push(Query.equal('type', dbType));
    }

    // Order by creation date (newest first)
    queries.push(Query.orderDesc('$createdAt'));

    const response = await databases.listDocuments(
      DATABASE_ID,
      CONTENT_COLLECTION_ID,
      queries
    );

    return {
      documents: response.documents as ContentDocument[],
      total: response.total,
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    showAppwriteError(error);
    throw error;
  }
}

