/** Add thousands separators to numeric amounts while preserving currency and text. */
export function formatPriceDisplay(value: string) {
  return value.replace(/\d[\d,]*(?:\.\d+)?/g, (amount) => {
    const numericAmount = Number(amount.replace(/,/g, ""));

    return Number.isFinite(numericAmount)
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(numericAmount)
      : amount;
  });
}
