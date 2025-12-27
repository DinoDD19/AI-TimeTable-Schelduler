import { useState, useCallback, useRef } from 'react';
import { HistoryItem, EnhancedScheduleEntry } from '@/types/scheduler';

/**
 * Custom hook for undo/redo functionality
 * Maintains a history stack of timetable states
 */
export const useUndoRedo = (maxHistory = 50) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoingRef = useRef(false);

  // Add a new state to history
  const pushState = useCallback((
    entries: EnhancedScheduleEntry[],
    action: string,
    description: string
  ) => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      action,
      entries: JSON.parse(JSON.stringify(entries)), // Deep clone
      description,
    };

    setHistory(prev => {
      // Remove any "future" states when adding new state
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newItem);
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  // Undo to previous state
  const undo = useCallback((): EnhancedScheduleEntry[] | null => {
    if (currentIndex <= 0) return null;
    
    isUndoingRef.current = true;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    return history[prevIndex]?.entries || null;
  }, [currentIndex, history]);

  // Redo to next state
  const redo = useCallback((): EnhancedScheduleEntry[] | null => {
    if (currentIndex >= history.length - 1) return null;
    
    isUndoingRef.current = true;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    return history[nextIndex]?.entries || null;
  }, [currentIndex, history]);

  // Check if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Get current action description
  const currentAction = history[currentIndex]?.description || null;
  const previousAction = history[currentIndex - 1]?.description || null;
  const nextAction = history[currentIndex + 1]?.description || null;

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentAction,
    previousAction,
    nextAction,
    historyLength: history.length,
    clearHistory,
  };
};
