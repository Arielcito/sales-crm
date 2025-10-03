import { db } from "@/lib/db"
import { exchangeRates } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

export async function getCurrentExchangeRate() {
  console.log("[exchange-rate.service] Fetching current exchange rate")

  const result = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.date))
    .limit(1)

  if (result.length === 0) {
    console.log("[exchange-rate.service] No exchange rate found, returning default")
    return {
      id: "default",
      date: new Date(),
      usdToArs: 1000,
      source: "default",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  const rate = result[0]

  console.log("[exchange-rate.service] Found exchange rate:", rate.usdToArs)

  return {
    id: rate.id,
    date: rate.date,
    usdToArs: parseFloat(rate.usdToArs),
    source: rate.source,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
  }
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount

  const rate = await getCurrentExchangeRate()

  if (fromCurrency === "USD" && toCurrency === "ARS") {
    return amount * rate.usdToArs
  }

  if (fromCurrency === "ARS" && toCurrency === "USD") {
    return amount / rate.usdToArs
  }

  return amount
}
