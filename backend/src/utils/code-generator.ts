export const generateCode = (prefix: string, sequence: number, date = new Date()): string => {
  const year = date.getFullYear();
  const padded = String(sequence).padStart(5, '0');
  return `${prefix}-${year}-${padded}`;
};
