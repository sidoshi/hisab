export const toLocaleString = (amount: number) => {
  return Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
