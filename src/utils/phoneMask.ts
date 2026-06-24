export const maskPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const truncated = digits.substring(0, 11);
  
  if (truncated.length <= 2) {
    return truncated.length > 0 ? `(${truncated}` : '';
  }
  if (truncated.length <= 6) {
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
  }
  if (truncated.length <= 10) {
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 6)}-${truncated.substring(6)}`;
  }
  return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 7)}-${truncated.substring(7)}`;
};

export const unmaskPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};
