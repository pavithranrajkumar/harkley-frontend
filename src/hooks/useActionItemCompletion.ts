import { useState, useEffect, useCallback } from 'react';
import { actionItemService } from '../services/actionItemService';
import type { UpdateActionItemData, ActionItem } from '../types/actionItem';
import { removeFromMap, removeFromSet } from '../utils/stateUtils';

type UpdateActionItemFunction = (actionItemId: string, data: UpdateActionItemData) => Promise<ActionItem | null>;

interface UseActionItemCompletionReturn {
  pendingCompletions: Set<string>;
  countdowns: Map<string, number>;
  handleToggle: (actionItemId: string, currentStatus: string, updateActionItem?: UpdateActionItemFunction) => void;
  handleUndo: (actionItemId: string, currentStatus: string, updateActionItem?: UpdateActionItemFunction) => void;
  isPending: (actionItemId: string) => boolean;
  getCountdown: (actionItemId: string) => number;
  isCompleted: (actionItemId: string, currentStatus: string) => boolean;
}

const clearTimer = (timerId: number | undefined) => {
  if (timerId) clearTimeout(timerId);
};

const updateActionItemStatus = async (
  actionItemId: string,
  status: 'pending' | 'completed',
  updateActionItem?: (actionItemId: string, data: UpdateActionItemData) => Promise<ActionItem | null>
) => {
  try {
    if (updateActionItem) {
      return await updateActionItem(actionItemId, { status });
    }
    return await actionItemService.updateActionItem(actionItemId, { status });
  } catch (err) {
    console.error(`Error updating action item status to ${status}:`, err);
    throw err;
  }
};

export const useActionItemCompletion = (): UseActionItemCompletionReturn => {
  const [pendingCompletions, setPendingCompletions] = useState<Set<string>>(new Set());
  const [countdowns, setCountdowns] = useState<Map<string, number>>(new Map());
  const [timers, setTimers] = useState<Map<string, number>>(new Map());

  // Generic state cleanup function
  const clearActionItemState = useCallback(
    (actionItemId: string) => {
      const timerId = timers.get(actionItemId);
      clearTimer(timerId);

      setTimers((prev) => removeFromMap(prev, actionItemId));
      setPendingCompletions((prev) => removeFromSet(prev, actionItemId));
      setCountdowns((prev) => removeFromMap(prev, actionItemId));
    },
    [timers]
  );

  // Generic state update function
  const updateState = useCallback(
    (
      actionItemId: string,
      timerId: number,
      updates: {
        addToPending?: boolean;
        setCountdown?: number;
      }
    ) => {
      if (updates.addToPending) {
        setPendingCompletions((prev) => new Set(prev).add(actionItemId));
      }

      if (updates.setCountdown !== undefined) {
        setCountdowns((prev) => new Map(prev).set(actionItemId, updates.setCountdown!));
      }

      setTimers((prev) => new Map(prev).set(actionItemId, timerId));
    },
    []
  );

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const newMap = new Map(prev);
        for (const [actionItemId, timeLeft] of newMap.entries()) {
          if (timeLeft <= 1) {
            newMap.delete(actionItemId);
          } else {
            newMap.set(actionItemId, timeLeft - 1);
          }
        }
        return newMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timers.forEach(clearTimer);
    };
  }, [timers]);

  const handleToggle = useCallback(
    (
      actionItemId: string,
      currentStatus: string,
      updateActionItem?: (actionItemId: string, data: UpdateActionItemData) => Promise<ActionItem | null>
    ) => {
      // If already pending completion, cancel it
      if (pendingCompletions.has(actionItemId)) {
        clearActionItemState(actionItemId);
        return;
      }

      // If already completed in database, do nothing
      if (currentStatus === 'completed') {
        return;
      }

      // Start completion process
      const timerId = window.setTimeout(async () => {
        try {
          await updateActionItemStatus(actionItemId, 'completed', updateActionItem);
          clearActionItemState(actionItemId);
        } catch {
          clearActionItemState(actionItemId);
        }
      }, 5000);

      updateState(actionItemId, timerId, { addToPending: true, setCountdown: 5 });
    },
    [pendingCompletions, clearActionItemState, updateState]
  );

  const handleUndo = useCallback(
    (
      actionItemId: string,
      currentStatus: string,
      updateActionItem?: (actionItemId: string, data: UpdateActionItemData) => Promise<ActionItem | null>
    ) => {
      clearActionItemState(actionItemId);

      // If it was completed, revert to pending
      if (currentStatus === 'completed') {
        updateActionItemStatus(actionItemId, 'pending', updateActionItem).catch((err) => {
          console.error('Error reverting action item:', err);
        });
      }
    },
    [clearActionItemState]
  );

  const isPending = useCallback((actionItemId: string) => pendingCompletions.has(actionItemId), [pendingCompletions]);

  const getCountdown = useCallback((actionItemId: string) => countdowns.get(actionItemId) || 0, [countdowns]);

  const isCompleted = useCallback(
    (actionItemId: string, currentStatus: string) => currentStatus === 'completed' || pendingCompletions.has(actionItemId),
    [pendingCompletions]
  );

  return {
    pendingCompletions,
    countdowns,
    handleToggle,
    handleUndo,
    isPending,
    getCountdown,
    isCompleted,
  };
};
