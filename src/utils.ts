export const roundToNDecimal = (num: number, decimal: number = 2): number => {
  const D = Math.pow(10, decimal);
  return Math.round((num + Number.EPSILON) * D) / D;
};
