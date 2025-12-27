import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  isEnabled?: boolean;
}

/**
 * Custom hook for keyboard navigation and shortcuts
 * Improves accessibility and power-user experience
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onUndo,
    onRedo,
    onDelete,
    isEnabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Don't trigger if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Undo: Ctrl/Cmd + Z
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      onUndo?.();
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((event.ctrlKey || event.metaKey) && (
      (event.key === 'z' && event.shiftKey) || 
      event.key === 'y'
    )) {
      event.preventDefault();
      onRedo?.();
      return;
    }

    // Arrow keys for navigation
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'Delete':
      case 'Backspace':
        if (!target.isContentEditable) {
          event.preventDefault();
          onDelete?.();
        }
        break;
    }
  }, [isEnabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onUndo, onRedo, onDelete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Hook to manage focus within a grid structure
 */
export const useGridNavigation = (rows: number, cols: number) => {
  const currentCell = useRef({ row: 0, col: 0 });

  const setCurrentCell = (row: number, col: number) => {
    currentCell.current = { row, col };
  };

  const moveUp = () => {
    if (currentCell.current.row > 0) {
      currentCell.current.row--;
    }
    return currentCell.current;
  };

  const moveDown = () => {
    if (currentCell.current.row < rows - 1) {
      currentCell.current.row++;
    }
    return currentCell.current;
  };

  const moveLeft = () => {
    if (currentCell.current.col > 0) {
      currentCell.current.col--;
    }
    return currentCell.current;
  };

  const moveRight = () => {
    if (currentCell.current.col < cols - 1) {
      currentCell.current.col++;
    }
    return currentCell.current;
  };

  return {
    currentCell: currentCell.current,
    setCurrentCell,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
  };
};
