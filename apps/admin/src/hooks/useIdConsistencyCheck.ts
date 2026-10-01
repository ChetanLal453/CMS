import { useEffect, useRef } from 'react';

interface IdConsistencyCheckOptions {
  componentId: string;
  componentType: string;
  expectedPrefix?: string;
  warnOnMissing?: boolean;
  warnOnMalformed?: boolean;
}

/**
 * React hook for tracking ID consistency between creation and rendering phases.
 * Helps identify where IDs are being lost or changed during the component lifecycle.
 *
 * @param options Configuration options for ID consistency checking
 */
export const useIdConsistencyCheck = ({
  componentId,
  componentType,
  expectedPrefix,
  warnOnMissing = true,
  warnOnMalformed = true
}: IdConsistencyCheckOptions) => {
  const initialIdRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const renderCount = renderCountRef.current;

    // Store initial ID on first render
    if (initialIdRef.current === null) {
      initialIdRef.current = componentId;
      console.log(`🔍 [useIdConsistencyCheck] INITIAL RENDER - ${componentType}:`, {
        componentId,
        componentType,
        expectedPrefix,
        timestamp: new Date().toISOString()
      });
    }

    const initialId = initialIdRef.current;

    // Check for missing ID
    if (warnOnMissing && (!componentId || componentId.trim() === '')) {
      console.error(`🚨 [useIdConsistencyCheck] MISSING ID - ${componentType}:`, {
        componentId,
        componentType,
        renderCount,
        expectedPrefix,
        timestamp: new Date().toISOString()
      });
    }

    // Check for malformed ID
    if (warnOnMalformed && componentId) {
      const issues: string[] = [];

      // Check expected prefix
      if (expectedPrefix && !componentId.startsWith(expectedPrefix)) {
        issues.push(`Expected prefix '${expectedPrefix}', got '${componentId}'`);
      }

      // Check for basic ID structure (should contain timestamp-like pattern)
      const hasTimestampPattern = /\d{10,}/.test(componentId);
      if (!hasTimestampPattern) {
        issues.push('ID does not contain expected timestamp pattern');
      }

      // Check for reasonable length
      if (componentId.length < 10) {
        issues.push('ID is suspiciously short');
      }

      if (issues.length > 0) {
        console.warn(`⚠️ [useIdConsistencyCheck] MALFORMED ID - ${componentType}:`, {
          componentId,
          componentType,
          issues,
          renderCount,
          expectedPrefix,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check for ID changes between renders
    if (initialId !== componentId) {
      console.error(`🚨 [useIdConsistencyCheck] ID CHANGED - ${componentType}:`, {
        initialId,
        currentId: componentId,
        componentType,
        renderCount,
        expectedPrefix,
        timestamp: new Date().toISOString()
      });
    }

    // Log successful consistency check
    if (componentId && initialId === componentId) {
      console.log(`✅ [useIdConsistencyCheck] CONSISTENT - ${componentType}:`, {
        componentId,
        componentType,
        renderCount,
        expectedPrefix,
        timestamp: new Date().toISOString()
      });
    }
  }, [componentId, componentType, expectedPrefix, warnOnMissing, warnOnMalformed]);

  // Return debug information
  return {
    initialId: initialIdRef.current,
    currentId: componentId,
    renderCount: renderCountRef.current,
    isConsistent: initialIdRef.current === componentId
  };
};
