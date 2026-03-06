import { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { getCategoryName, updateCategory, validateFreeTemptationLimit, type Category } from '../lib/categories';
import { fetchContent, type ContentDocument } from '../lib/content';
import { showAppwriteError, showSuccess } from '../lib/notifications';
import { useCategoriesStore } from '../store/categoriesStore';

const TEMPTATIONS_LIMIT = 500;

export const FreeContent = () => {
  const { categories, loadCategories, refreshCategories, isLoading: categoriesLoading } = useCategoriesStore();
  const [temptationsByCategory, setTemptationsByCategory] = useState<Record<string, ContentDocument[]>>({});
  const [temptationsLoading, setTemptationsLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveAllSaving, setSaveAllSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Fetch all temptations and group by category
  useEffect(() => {
    if (categories.length === 0) return;

    const loadTemptations = async () => {
      setTemptationsLoading(true);
      try {
        const { documents } = await fetchContent(
          TEMPTATIONS_LIMIT,
          0,
          undefined,
          { type: '40-temptations' }
        );
        const byCategory: Record<string, ContentDocument[]> = {};
        for (const cat of categories) {
          byCategory[cat.$id] = documents.filter((d) => d.category === cat.$id);
        }
        setTemptationsByCategory(byCategory);
      } catch (err) {
        console.error('Failed to load temptations:', err);
        showAppwriteError(err);
        setTemptationsByCategory({});
      } finally {
        setTemptationsLoading(false);
      }
    };

    loadTemptations();
  }, [categories]);

  // Initialize selections from categories
  useEffect(() => {
    if (categories.length === 0) return;
    const initial: Record<string, string> = {};
    for (const cat of categories) {
      const id = cat.freeTemptationContentId ?? '';
      initial[cat.$id] = id && String(id).trim() ? id : '';
    }
    setSelections((prev) => (Object.keys(prev).length === 0 ? initial : prev));
  }, [categories]);

  const freeCount = useMemo(() => {
    return Object.values(selections).filter((v) => v !== '').length;
  }, [selections]);

  const optionsForCategory = (categoryId: string): SelectOption[] => {
    const list = temptationsByCategory[categoryId] ?? [];
    const options: SelectOption[] = [{ value: '', label: 'None' }];
    list.forEach((doc) => {
      options.push({ value: doc.$id, label: doc.title || doc.$id });
    });
    return options;
  };

  const handleSelectionChange = (categoryId: string, value: string) => {
    const newVal = value ?? '';
    if (newVal !== '' && freeCount >= 3) {
      const current = selections[categoryId];
      if (current === '' || current === undefined) {
        setError('Maximum of 3 categories with a free temptation. Clear one to assign another.');
        return;
      }
    }
    setError(null);
    setSelections((prev) => ({ ...prev, [categoryId]: newVal }));
  };

  const saveCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.$id === categoryId);
    if (!category) return;

    const newContentId = selections[categoryId] ?? '';
    const newFreeId = newContentId.trim() || null;

    try {
      validateFreeTemptationLimit(categories, categoryId, newFreeId);
    } catch (err) {
      showAppwriteError(err);
      return;
    }

    setSavingId(categoryId);
    setError(null);
    try {
      await updateCategory(categoryId, {
        freeTemptationContentId: newFreeId,
        isFreeCategory: !!newFreeId,
      });
      showSuccess('Saved.');
      await refreshCategories();
    } catch (err) {
      showAppwriteError(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    const newFreeCount = Object.values(selections).filter((v) => v !== '').length;
    if (newFreeCount > 3) {
      setError('At most 3 categories can have a free temptation. Clear one to assign another.');
      return;
    }

    setSaveAllSaving(true);
    setError(null);

    const toUpdate = categories.filter((cat) => {
      const newVal = (selections[cat.$id] ?? '').trim() || null;
      const current = cat.freeTemptationContentId ?? null;
      const currentNorm = current && String(current).trim() ? current : null;
      return newVal !== currentNorm;
    });

    try {
      for (const cat of toUpdate) {
        const newFreeId = (selections[cat.$id] ?? '').trim() || null;
        validateFreeTemptationLimit(categories, cat.$id, newFreeId);
      }
      for (const cat of toUpdate) {
        const newFreeId = (selections[cat.$id] ?? '').trim() || null;
        await updateCategory(cat.$id, {
          freeTemptationContentId: newFreeId,
          isFreeCategory: !!newFreeId,
        });
      }
      if (toUpdate.length > 0) {
        showSuccess('All changes saved.');
        await refreshCategories();
      }
    } catch (err) {
      showAppwriteError(err);
    } finally {
      setSaveAllSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    return categories.some((cat) => {
      const newVal = (selections[cat.$id] ?? '').trim() || null;
      const current = cat.freeTemptationContentId ?? null;
      const currentNorm = current && String(current).trim() ? current : null;
      return newVal !== currentNorm;
    });
  }, [categories, selections]);

  if (categoriesLoading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-white font-roboto">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen">
      <div className="px-8 pt-9 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-white text-[24px] leading-[normal]"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
          >
            Free content
          </h1>
          {hasChanges && (
            <Button
              className="w-[120px] h-[56px]"
              onClick={handleSaveAll}
              disabled={saveAllSaving}
            >
              {saveAllSaving ? 'Saving...' : 'Save all'}
            </Button>
          )}
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-[16px] bg-[rgba(255,200,200,0.15)] border border-[rgba(255,100,100,0.3)] text-[#f0a0a0] text-[14px]"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {error}
          </div>
        )}

        <p className="text-[#8f8f8f] text-[14px] mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
          At most 3 categories can have a free temptation. Select one temptation per category or None.
        </p>

        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8 flex flex-col gap-6">
          {categories.map((category: Category) => (
            <div
              key={category.$id}
              className="flex flex-wrap items-center gap-4 py-3 border-b border-[rgba(255,255,255,0.08)] last:border-b-0"
            >
              <div className="min-w-[180px] text-white text-[16px]" style={{ fontFamily: 'Cinzel, serif' }}>
                {getCategoryName(category)}
              </div>
              <div className="flex-1 min-w-[200px] max-w-[400px]">
                <Select
                  options={temptationsLoading ? [{ value: '', label: 'Loading...' }] : optionsForCategory(category.$id)}
                  value={selections[category.$id] ?? ''}
                  onChange={(value) => handleSelectionChange(category.$id, value)}
                  placeholder="None"
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                className="w-[100px] h-[48px]"
                onClick={() => saveCategory(category.$id)}
                disabled={savingId !== null || temptationsLoading}
              >
                {savingId === category.$id ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ))}
        </div>

        {categories.length === 0 && !categoriesLoading && (
          <p className="text-[#8f8f8f] text-[14px] mt-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
            No categories found.
          </p>
        )}
      </div>
    </div>
  );
};
