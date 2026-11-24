import { query } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";

export const DEFAULT_USD_TO_GHS_RATE = 11.69;

export async function getUsdToGhsRate() {
  "use cache";
  cacheLife("minutes");
  cacheTag("exchange-rate");

  try {
    const result = await query<{ setting_value: string }>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'usd_to_ghs_rate' LIMIT 1",
    );
    const rate = Number(result.rows[0]?.setting_value);
    return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_USD_TO_GHS_RATE;
  } catch {
    return DEFAULT_USD_TO_GHS_RATE;
  }
}
