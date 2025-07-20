import { useState, useCallback, useRef } from 'react';
import { actionItemService } from '../services/actionItemService';
import type { ActionItem, CreateActionItemData, UpdateActionItemData } from '../types/actionItem';

interface UseActionItemsParams {
  meetingId?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  page?: number;
  limit?: number;
}

interface UseActionItemsReturn {
  actionItems: ActionItem[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  fetchActionItems: (params?: UseActionItemsParams) => Promise<void>;
  createActionItem: (data: CreateActionItemData) => Promise<ActionItem | null>;
  updateActionItem: (actionItemId: string, data: UpdateActionItemData) => Promise<ActionItem | null>;
  refreshActionItems: () => Promise<void>;
}

// Utility functions
const sortActionItems = (items: ActionItem[]): ActionItem[] => {
  return items.sort((a, b) => {
    const aIsCompleted = a.status === 'completed';
    const bIsCompleted = b.status === 'completed';

    if (aIsCompleted && !bIsCompleted) return 1;
    if (!aIsCompleted && bIsCompleted) return -1;
    return 0;
  });
};

const handleApiError = (error: unknown, operation: string): string => {
  const message = error instanceof Error ? error.message : `Failed to ${operation}`;
  console.error(`Error ${operation}:`, error);
  return message;
};

export const useActionItems = (initialParams: UseActionItemsParams = {}): UseActionItemsReturn => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentParamsRef = useRef(initialParams);

  // Generic state updater that maintains sorting
  const updateActionItemsWithSorting = useCallback((updater: (prev: ActionItem[]) => ActionItem[]) => {
    setActionItems((prev) => sortActionItems(updater(prev)));
  }, []);

  // Generic API operation wrapper
  const withErrorHandling = useCallback(async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T | null> => {
    try {
      return await operation();
    } catch (err) {
      setError(handleApiError(err, errorMessage));
      return null;
    }
  }, []);

  const fetchActionItems = useCallback(
    async (params: UseActionItemsParams = {}) => {
      setLoading(true);
      setError(null);

      const result = await withErrorHandling(async () => {
        const mergedParams = { ...currentParamsRef.current, ...params };
        currentParamsRef.current = mergedParams;
        return await actionItemService.getActionItems(mergedParams);
      }, 'fetch action items');

      if (result) {
        setActionItems(sortActionItems(result.actionItems));
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      }

      setLoading(false);
    },
    [withErrorHandling]
  );

  const createActionItem = useCallback(
    async (data: CreateActionItemData): Promise<ActionItem | null> => {
      const result = await withErrorHandling(() => actionItemService.createActionItem(data), 'create action item');

      if (result) {
        updateActionItemsWithSorting((prev) => [result, ...prev]);
        setTotal((prev) => prev + 1);
      }

      return result;
    },
    [withErrorHandling, updateActionItemsWithSorting]
  );

  const updateActionItem = useCallback(
    async (actionItemId: string, data: UpdateActionItemData): Promise<ActionItem | null> => {
      const result = await withErrorHandling(() => actionItemService.updateActionItem(actionItemId, data), 'update action item');

      if (result) {
        updateActionItemsWithSorting((prev) => {
          const updated = prev.map((item) => {
            if (item.id === actionItemId) {
              return { ...item, ...result };
            }
            return item;
          });
          return updated;
        });
      }

      return result;
    },
    [withErrorHandling, updateActionItemsWithSorting]
  );

  const refreshActionItems = useCallback(async () => {
    await fetchActionItems(currentParamsRef.current);
  }, [fetchActionItems]);

  return {
    actionItems,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchActionItems,
    createActionItem,
    updateActionItem,
    refreshActionItems,
  };
};
