import { tablesDB } from './appwrite';
import { Query } from 'appwrite';
import type { SelectOption } from '../components/Select';

export interface Category {
  $id: string;
  name?: string;
  title?: string;
  label?: string;
  order?: number;
  /** Content $id that is free in this category. At most 3 categories should have this set. */
  freeTemptationContentId?: string | null;
  /** Convenience flag for admin UI; can be derived from freeTemptationContentId != null */
  isFreeCategory?: boolean;
  [key: string]: unknown;
}

/**
 * Gets the display name from a category document
 * Tries name, title, label, or $id in that order
 */
export function getCategoryName(category: Category): string {
  return category.name || category.title || category.label || category.$id;
}

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const CATEGORY_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CATEGORY_COLLECTION_ID || 'category';

/**
 * Fetches all categories from AppWrite
 * @returns Promise<Category[]> Array of category documents
 */
export async function fetchCategories(): Promise<Category[]> {
  // Validate environment variables
  if (!DATABASE_ID) {
    const error = new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  if (!CATEGORY_COLLECTION_ID) {
    const error = new Error(
      'VITE_APPWRITE_CATEGORY_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
    console.error('Configuration Error:', error.message);
    throw error;
  }

  console.log('Fetching categories from:', {
    databaseId: DATABASE_ID,
    tableId: CATEGORY_COLLECTION_ID,
  });

  try {
    // Fetch categories sorted by order field (ascending)
    let response;
    try {
      response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CATEGORY_COLLECTION_ID,
        queries: [
          Query.orderAsc('order'), // Sort by order field in ascending order
        ]
      });
    } catch (queryError) {
      // If query fails (e.g., order field doesn't exist or isn't indexed), fetch without ordering
      console.warn('Failed to fetch with order query, trying without query:', queryError);
      response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CATEGORY_COLLECTION_ID
      });
    }

    console.log('Successfully fetched categories:', response.rows.length);
    
    // Log first category structure for debugging
    if (response.rows.length > 0) {
      console.log('Sample category structure:', Object.keys(response.rows[0]));
      console.log('Sample category data:', response.rows[0]);
    }
    
    // Sort manually by order (ascending) if query ordering didn't work
    const documents = response.rows as Category[];
    if (documents.length > 0 && typeof documents[0].order === 'number') {
      // If we have order field, sort by it (ascending)
      documents.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB; // Ascending order
      });
    } else {
      // Fallback: sort by display name if order field doesn't exist
      documents.sort((a, b) => getCategoryName(a).localeCompare(getCategoryName(b)));
    }
    
    return documents;
  } catch (error: unknown) {
    // Enhanced error logging
    if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message?: string; code?: string; type?: string };
      console.error('Error fetching categories:', {
        message: errorObj.message,
        code: errorObj.code || 'unknown',
        type: errorObj.type || 'unknown',
        databaseId: DATABASE_ID,
        collectionId: CATEGORY_COLLECTION_ID,
      });
    } else {
      console.error('Unknown error fetching categories:', error);
    }

    // Provide helpful error message
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : 'Failed to fetch categories';

    if (errorMessage.includes('404') || errorMessage.includes('Route not found')) {
      const detailedError = new Error(
        `Category collection not found (404). Please verify:\n` +
        `1. Database ID is set: ${DATABASE_ID ? '✅' : '❌ Missing VITE_APPWRITE_DATABASE_ID'}\n` +
        `2. Collection ID: "${CATEGORY_COLLECTION_ID}"\n` +
        `3. The collection "${CATEGORY_COLLECTION_ID}" exists in database "${DATABASE_ID}"\n` +
        `4. Your AppWrite project has the correct API key and permissions\n` +
        `5. Check your AppWrite console to verify the database and collection IDs`
      );
      console.error(detailedError.message);
      throw detailedError;
    }

    throw error;
  }
}

/**
 * Converts categories to SelectOption format
 * @param categories Array of category documents
 * @returns SelectOption[] Array of select options
 */
export function categoriesToSelectOptions(categories: Category[]): SelectOption[] {
  const options: SelectOption[] = [
    { value: '', label: 'Select Category' },
  ];

  categories.forEach((category) => {
    options.push({
      value: category.$id,
      label: getCategoryName(category),
    });
  });

  return options;
}

/**
 * Converts categories to category cards data
 * @param categories Array of category documents
 * @returns Array of objects with stable id + display name
 */
export function categoriesToCategoryCards(
  categories: Category[]
): Array<{ id: string; name: string }> {
  return categories.map((category) => ({ id: category.$id, name: getCategoryName(category) }));
}

/**
 * Count how many categories have a free temptation set
 */
export function countCategoriesWithFreeTemptation(categories: Category[]): number {
  return categories.filter(
    (c) => c.freeTemptationContentId != null && String(c.freeTemptationContentId).trim() !== ''
  ).length;
}

const MAX_CATEGORIES_WITH_FREE_TEMPTATION = 3;

/**
 * Validates that setting freeTemptationContentId on a category would not exceed the limit of 3.
 * Call before updateCategory when setting a non-null freeTemptationContentId.
 * @throws Error if the limit would be exceeded
 */
export function validateFreeTemptationLimit(
  categories: Category[],
  categoryIdBeingUpdated: string,
  newFreeContentId: string | null
): void {
  if (newFreeContentId == null || String(newFreeContentId).trim() === '') {
    return; // Clearing is always allowed
  }
  const category = categories.find((c) => c.$id === categoryIdBeingUpdated);
  const alreadyHadFree = category && category.freeTemptationContentId != null && String(category.freeTemptationContentId).trim() !== '';
  const currentCount = countCategoriesWithFreeTemptation(categories);
  const newCount = alreadyHadFree ? currentCount : currentCount + 1;
  if (newCount > MAX_CATEGORIES_WITH_FREE_TEMPTATION) {
    throw new Error(
      `At most ${MAX_CATEGORIES_WITH_FREE_TEMPTATION} categories can have a free temptation. Clear one to assign another.`
    );
  }
}

export interface UpdateCategoryData {
  freeTemptationContentId?: string | null;
  isFreeCategory?: boolean;
}

/**
 * Update a category's free-content fields in Appwrite
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryData
): Promise<void> {
  if (!DATABASE_ID) {
    throw new Error(
      'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Please add it to your .env file.'
    );
  }
  if (!CATEGORY_COLLECTION_ID) {
    throw new Error(
      'VITE_APPWRITE_CATEGORY_COLLECTION_ID is not set in environment variables. Please add it to your .env file.'
    );
  }
  const payload: Record<string, unknown> = {};
  if (data.freeTemptationContentId !== undefined) {
    payload.freeTemptationContentId = data.freeTemptationContentId;
  }
  if (data.isFreeCategory !== undefined) {
    payload.isFreeCategory = data.isFreeCategory;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: CATEGORY_COLLECTION_ID,
    rowId: categoryId,
    data: payload,
  });
}

