import { db } from "@/lib/db"
import { exchangeRates } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

interface ExchangeRate {
  id: string
  date: Date
  usdToArs: string
  source: string
  createdAt: Date
  updatedAt: Date
}

export async function getLatestExchangeRate(): Promise<ExchangeRate | null> {
  console.log("[exchange-rate.service] Fetching latest exchange rate")

  const result = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.createdAt))
    .limit(1)

  if (result.length === 0) {
    console.log("[exchange-rate.service] No exchange rate found")
    return null
  }

  const rate = result[0]

  return {
    id: rate.id,
    date: new Date(rate.date),
    usdToArs: rate.usdToArs,
    source: rate.source,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
  }
}

interface CreateExchangeRateData {
  usdToArs: string
  source?: string
}

export async function createExchangeRate(data: CreateExchangeRateData): Promise<ExchangeRate> {
  console.log("[exchange-rate.service] Creating exchange rate:", data.usdToArs)

  const result = await db.insert(exchangeRates).values({
    date: new Date().toISOString().split("T")[0],
    usdToArs: data.usdToArs,
    source: data.source || "dolarapi",
  }).returning()

  const rate = result[0]

  console.log("[exchange-rate.service] Exchange rate created:", rate.id)

  return {
    id: rate.id,
    date: new Date(rate.date),
    usdToArs: rate.usdToArs,
    source: rate.source,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
  }
}

export async function getOrCreateExchangeRate(usdToArs: string): Promise<ExchangeRate> {
  console.log("[exchange-rate.service] Getting or creating exchange rate:", usdToArs)

  const today = new Date().toISOString().split("T")[0]

  const result = await db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.date, today))
    .orderBy(desc(exchangeRates.createdAt))
    .limit(1)

  if (result.length > 0) {
    console.log("[exchange-rate.service] Using existing exchange rate")
    const rate = result[0]
    return {
      id: rate.id,
      date: new Date(rate.date),
      usdToArs: rate.usdToArs,
      source: rate.source,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    }
  }

  return createExchangeRate({ usdToArs, source: "dolarapi" })
}
