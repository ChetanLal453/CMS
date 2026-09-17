export const getDisplayValue = (value: unknown): string => {
  if (value == null) return '';
  return String(value);
};
