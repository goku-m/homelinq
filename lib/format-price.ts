/** Add thousands separators to numeric amounts while preserving currency and text. */
export function formatPriceDisplay(value: string) {
  return value.replace(/\d[\d,]*(?:\.\d+)?/g, (amount) => {
    const numericAmount = Number(amount.replace(/,/g, ""));

    return Number.isFinite(numericAmount)
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(numericAmount)
      : amount;
  });
}

const ghanaCediPattern = /(?:GHC|GHS|GH\u20b5|\u20b5|GH\u00e2\u201a\u00b5|\u00e2\u201a\u00b5|GH\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00b5|\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00b5)/i;
const registrationCurrencyPattern = /(?:GHC|GHS|USD|GH\u20b5|\u20b5|GH\u00e2\u201a\u00b5|\u00e2\u201a\u00b5|GH\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00b5|\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00b5|\$)/gi;

export function formatRegistrationFeeDisplay(value: string) {
  const trimmedValue = value.trim();
  const amount = formatPriceDisplay(trimmedValue.replace(registrationCurrencyPattern, "").trim());

  if (!amount) {
    return "";
  }

  if (ghanaCediPattern.test(trimmedValue)) {
    return "GH\u20b5 " + amount;
  }

  if (/USD|\$/i.test(trimmedValue)) {
    return "$ " + amount;
  }

  return formatPriceDisplay(value);
}
