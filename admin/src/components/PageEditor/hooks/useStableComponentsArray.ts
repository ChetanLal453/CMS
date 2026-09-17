import { useMemo, useRef } from 'react';
import { LayoutComponent } from '@/types/page-editor';

/**
 * Custom hook to create stable component array references
 * Prevents unnecessary re-renders by maintaining stable references
 * when component contents haven't actually changed
 */
export const useStableComponentsArray = (
  components: (LayoutComponent | null)[],
  columns: number,
  rows: number
) => {
  const prevComponentsRef = useRef<(LayoutComponent | null)[]>([]);
  const prevResultRef = useRef<(LayoutComponent | null)[]>([]);

  return useMemo(() => {
    const totalCells = columns * rows;
    const comps = [...components];

    // Ensure array has correct size
    while (comps.length < totalCells) {
      comps.push(null);
    }
    comps.splice(totalCells);

    // Check if components actually changed (deep comparison of IDs and types only)
    const prevComponents = prevComponentsRef.current;
    const hasChanged = comps.length !== prevComponents.length ||
      comps.some((comp, index) => {
        const prevComp = prevComponents[index];
        return comp?.id !== prevComp?.id || comp?.type !== prevComp?.type;
      });

    if (!hasChanged) {
      // Return previous stable reference
      return prevResultRef.current;
    }

    // Update refs and return new array
    prevComponentsRef.current = [...comps];
    prevResultRef.current = comps;

    return comps;
  }, [components, columns, rows]);
};
