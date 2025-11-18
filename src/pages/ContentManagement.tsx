import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { Button } from '../components/Button';
import { fetchContent, type ContentDocument } from '../lib/content';
import { fetchCategories, getCategoryName, type Category } from '../lib/categories';
import { showAppwriteError } from '../lib/notifications';

interface ContentItem extends Record<string, unknown> {
  id: string;
  title: string;
  category: string; // Display name or empty string
  role: string; // Capitalized: Support, Recovery, Prevention
  type: string; // Display: '40 Temptations' or '40 Day Journey'
  // Journey-specific fields
  tasks?: string[];
  hasAudio?: boolean;
}

/**
 * Map Appwrite content document to ContentItem for display
 */
function mapContentToItem(
  doc: ContentDocument,
  categories: Category[]
): ContentItem {
  // Get category name from ID
  let categoryName = '';
  if (doc.category) {
    const category = categories.find((cat) => cat.$id === doc.category);
    categoryName = category ? getCategoryName(category) : '';
  }

  // Capitalize role (support -> Support, recovery -> Recovery)
  const roleDisplay = doc.role
    ? doc.role.charAt(0).toUpperCase() + doc.role.slice(1)
    : '';

  // Map database type to display type
  const typeDisplay =
    doc.type === 'forty_day_journey'
      ? '40 Day Journey'
      : doc.type === 'forty_temptations'
      ? '40 Temptations'
      : doc.type;

  return {
    id: doc.$id,
    title: doc.title,
    category: categoryName,
    role: roleDisplay,
    type: typeDisplay,
    tasks: doc.tasks,
    hasAudio: doc.files && doc.files.length > 0,
  };
}


const roleOptions: SelectOption[] = [
  { value: '', label: 'All Roles' },
  { value: 'support', label: 'Support' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'prevention', label: 'Prevention' },
];

const typeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: '40-temptations', label: '40 Temptations' },
  { value: '40-day-journey', label: '40 Day Journey' },
];

export const ContentManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Continue without categories - content will still load
      }
    };
    loadCategories();
  }, []);

  // Fetch content when filters, search, or pagination changes
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate offset for pagination
        const offset = (currentPage - 1) * itemsPerPage;

        // Map filter values to database values
        const filters: {
          category?: string;
          role?: string;
          type?: string;
        } = {};

        // Category filter - use category ID directly
        if (selectedCategory) {
          // selectedCategory is already the category ID from the dropdown
          filters.category = selectedCategory;
        }

        // Role filter - convert display to database value
        if (selectedRole) {
          const roleOption = roleOptions.find(
            (opt) => opt.value === selectedRole
          );
          if (roleOption && roleOption.label !== 'All Roles') {
            filters.role = roleOption.value; // Already lowercase
          }
        }

        // Type filter
        if (selectedType) {
          filters.type = selectedType;
        }

        // Fetch content from Appwrite
        const result = await fetchContent(
          itemsPerPage,
          offset,
          searchQuery || undefined,
          Object.keys(filters).length > 0 ? filters : undefined
        );

        // Map documents to display items
        const mappedItems = result.documents.map((doc) =>
          mapContentToItem(doc, categories)
        );

        setContentItems(mappedItems);
        setTotalItems(result.total);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please try again.');
        showAppwriteError(err);
        setContentItems([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedCategory,
    selectedRole,
    selectedType,
    categories,
  ]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUploadModalOpen) {
        setIsUploadModalOpen(false);
      }
    };

    if (isUploadModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isUploadModalOpen]);

  // Update category options when categories are loaded
  const categoryOptions: SelectOption[] = useMemo(() => [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({
      value: cat.$id,
      label: getCategoryName(cat),
    })),
  ], [categories]);

  const columns: Column<ContentItem>[] = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'role', label: 'Role' },
    { key: 'type', label: 'Type' },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRowClick = (row: ContentItem) => {
    // Navigate based on the item type and pass data via state
    if (row.type === '40 Day Journey') {
      navigate(`/content-management/journey-40-day/${row.id}`, {
        state: { journeyData: row },
      });
    } else if (row.type === '40 Temptations') {
      navigate(`/content-management/temptation-details`, {
        state: { temptationData: row },
      });
    }
  };

  return (
    <div className="bg-neutral-950 min-h-screen p-8">
      {/* Page Title */}
      <h1 
        className="text-white text-[16px] leading-[24px] mb-8"
        style={{ fontFamily: 'Cinzel, serif', fontWeight: 550 }}
      >
        Content Management
      </h1>

      {/* Header Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 min-w-[300px]">
          <SearchBar
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="w-[168px]">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            placeholder="Category"
          />
        </div>

        <div className="w-[128px]">
          <Select
            options={roleOptions}
            value={selectedRole}
            onChange={(value) => {
              setSelectedRole(value);
              setCurrentPage(1);
            }}
            placeholder="Role"
          />
        </div>

        <div className="w-[128px]">
          <Select
            options={typeOptions}
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              setCurrentPage(1);
            }}
            placeholder="Type"
          />
        </div>

        {/* Upload Button */}
        <Button className="w-[208px]" onClick={() => setIsUploadModalOpen(true)}>
          Upload New Content
        </Button>
      </div>

      {/* Data Table */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white text-[16px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Loading content...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-400 text-[16px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {error}
            </p>
          </div>
        ) : contentItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white text-[16px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              No content found. Try adjusting your filters or create new content.
            </p>
          </div>
        ) : (
          <DataTable<ContentItem> 
            columns={columns} 
            data={contentItems} 
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsUploadModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          
          {/* Modal Content */}
          <div
            className="relative backdrop-blur-[20px] bg-[rgba(255,255,255,0.1)] rounded-[16px] px-[32px] py-[40px] w-[406px] flex flex-col gap-[32px] items-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <p
              className="font-normal text-[24px] text-center text-white w-full whitespace-pre-wrap"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What type of content are you trying to upload.
            </p>

            {/* Button Container */}
            <div className="flex flex-col gap-[16px] w-full">
              <Button
                className="h-[48px] w-full"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  navigate('/content-management/temptation-details');
                }}
              >
                40 Temptations
              </Button>
              <Button
                className="h-[48px] w-full"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  navigate('/content-management/create-journey-40-day');
                }}
              >
                40 Day Journey
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

