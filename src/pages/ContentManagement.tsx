import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { Button } from '../components/Button';

interface ContentItem extends Record<string, unknown> {
  id: string;
  title: string;
  category: string;
  role: string;
  type: string;
  // Journey-specific fields
  tasks?: string[];
  hasAudio?: boolean;
}

const sampleData: ContentItem[] = [
  {
    id: '1',
    title: 'Anxiety',
    category: 'Emotional & Psychological Triggers',
    role: 'Support',
    type: '40 Temptations',
  },
  {
    id: '2',
    title: 'Day 3',
    category: '',
    role: '',
    type: '40 Day Journey',
    tasks: ['Day 3 Check-in', 'Read a Book', 'You should listen to this', 'Exercise', 'Exercise'],
    hasAudio: true,
  },
  {
    id: '3',
    title: 'Death of a Friend',
    category: 'Emotional & Psychological Triggers',
    role: 'Recovery',
    type: '40 Day Journey',
    tasks: ['Grief Processing', 'Write in Journal', 'Connect with Support', 'Practice Self-care', 'Reflect on Memories'],
    hasAudio: true,
  },
  {
    id: '4',
    title: 'Day 2',
    category: '',
    role: '',
    type: '40 Day Journey',
    tasks: ['Day 2 Check-in', 'Read a Book', 'You should listen to this', 'Exercise', 'Exercise'],
    hasAudio: true,
  },
  {
    id: '5',
    title: 'Economic Status',
    category: 'Financial & Lifestyle Impacts',
    role: 'Recovery',
    type: '40 Temptations',
  },
  {
    id: '6',
    title: 'Avoiding the Doctor',
    category: 'Physical Health & Medical Avoidance',
    role: 'Support',
    type: '40 Temptations',
  },
  {
    id: '7',
    title: 'Economic Status',
    category: 'Financial & Lifestyle Impacts',
    role: 'Recovery',
    type: '40 Temptations',
  },
  {
    id: '8',
    title: 'Avoiding the Doctor',
    category: 'Physical Health & Medical Avoidance',
    role: 'Support',
    type: '40 Temptations',
  },
];

// Generate more sample data to reach 330 items
const generateMoreData = (): ContentItem[] => {
  const categories = [
    'Emotional & Psychological Triggers',
    'Financial & Lifestyle Impacts',
    'Physical Health & Medical Avoidance',
    'Social & Relationship Challenges',
  ];
  const roles = ['Support', 'Recovery', 'Prevention'];
  const types = ['40 Temptations', '40 Day Journey'];
  const titles = [
    'Anger',
    'Depression',
    'Loneliness',
    'Stress',
    'Work Pressure',
    'Family Issues',
    'Health Concerns',
    'Financial Worries',
    'Day 1',
    'Day 4',
    'Day 5',
    'Day 6',
    'Day 7',
    'Day 8',
    'Day 9',
    'Day 10',
  ];

  const data: ContentItem[] = [];
  for (let i = 0; i < 330 - sampleData.length; i++) {
    const titleIndex = i % titles.length;
    const categoryIndex = i % categories.length;
    const roleIndex = i % roles.length;
    const typeIndex = i % types.length;
    const isJourney = types[typeIndex] === '40 Day Journey';

    data.push({
      id: String(sampleData.length + i + 1),
      title: titles[titleIndex],
      category: Math.random() > 0.3 ? categories[categoryIndex] : '',
      role: Math.random() > 0.3 ? roles[roleIndex] : '',
      type: types[typeIndex],
      // Add tasks for journey items
      tasks: isJourney ? [
        `${titles[titleIndex]} Check-in`,
        'Read a Book',
        'You should listen to this',
        'Exercise',
        'Exercise',
      ] : undefined,
      hasAudio: isJourney ? Math.random() > 0.5 : false,
    });
  }

  return [...sampleData, ...data];
};

const allData = generateMoreData();

const categoryOptions: SelectOption[] = [
  { value: '', label: 'All Categories' },
  { value: 'emotional', label: 'Emotional & Psychological Triggers' },
  { value: 'financial', label: 'Financial & Lifestyle Impacts' },
  { value: 'physical', label: 'Physical Health & Medical Avoidance' },
  { value: 'social', label: 'Social & Relationship Challenges' },
];

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

  // Filter data based on search and filters
  const filteredData = allData.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      item.category ===
        categoryOptions.find((opt) => opt.value === selectedCategory)?.label;

    const matchesRole =
      !selectedRole ||
      item.role === roleOptions.find((opt) => opt.value === selectedRole)?.label;

    const matchesType =
      !selectedType ||
      item.type === typeOptions.find((opt) => opt.value === selectedType)?.label;

    return (
      matchesSearch && matchesCategory && matchesRole && matchesType
    );
  });

  // Paginate filtered data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalItems = filteredData.length;

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
        <DataTable<ContentItem> 
          columns={columns} 
          data={paginatedData} 
          onRowClick={handleRowClick}
        />
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

