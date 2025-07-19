import { useState, useEffect } from 'react';
import type { ActionItem } from '../types/meeting';

export const useActionItems = (initialItems: ActionItem[]) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialItems);
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});
  const [undoItems, setUndoItems] = useState<{ [key: string]: boolean }>({});
  const [countdownTimers, setCountdownTimers] = useState<{ [key: string]: number }>({});

  const handleActionItemToggle = (itemId: string) => {
    const isCurrentlyCompleted = completedItems[itemId];

    if (!isCurrentlyCompleted) {
      // Marking as completed - start timer
      setCompletedItems((prev) => ({ ...prev, [itemId]: true }));
      setUndoItems((prev) => ({ ...prev, [itemId]: true }));
      setCountdownTimers((prev) => ({ ...prev, [itemId]: 5 })); // Start with 5 seconds

      // Set timer to hide after 5 seconds
      setTimeout(() => {
        setCompletedItems((prev) => {
          if (prev[itemId]) {
            // Only hide if still completed
            setActionItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
            setUndoItems((prevUndo) => ({ ...prevUndo, [itemId]: false }));
            setCountdownTimers((prevTimers) => ({ ...prevTimers, [itemId]: 0 }));
          }
          return prev;
        });
      }, 5000);
    } else {
      // Unchecking - cancel timer and hide undo
      setCompletedItems((prev) => ({ ...prev, [itemId]: false }));
      setUndoItems((prev) => ({ ...prev, [itemId]: false }));
      setCountdownTimers((prev) => ({ ...prev, [itemId]: 0 }));
    }
  };

  const handleUndo = (itemId: string) => {
    setCompletedItems((prev) => ({ ...prev, [itemId]: false }));
    setUndoItems((prev) => ({ ...prev, [itemId]: false }));
    setCountdownTimers((prev) => ({ ...prev, [itemId]: 0 }));
  };

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimers((prev) => {
        const newTimers = { ...prev };
        let hasActiveTimers = false;

        Object.keys(newTimers).forEach((itemId) => {
          if (newTimers[itemId] > 0) {
            newTimers[itemId] -= 1;
            hasActiveTimers = true;
          }
        });

        // Clear interval if no active timers
        if (!hasActiveTimers) {
          clearInterval(interval);
        }

        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownTimers]);

  return {
    actionItems,
    completedItems,
    undoItems,
    countdownTimers,
    handleActionItemToggle,
    handleUndo,
  };
};
