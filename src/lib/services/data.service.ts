import { getAllDeals, updateDeal, convertAmount } from "./deal.service"
import { getAllCompanies } from "./company.service"
import { getAllContacts } from "./contact.service"
import { getAllUsers } from "./user.service"
import type { Deal, Company, Contact, User, Currency } from "@/lib/types"

export async function getDeals(userId?: string): Promise<Deal[]> {
  return getAllDeals({ userId })
}

export async function updateDealData(id: string, updates: Partial<Deal>): Promise<Deal | null> {
  return updateDeal(id, {
    title: updates.title,
    currency: updates.currency,
    amountUsd: updates.amountUsd ?? undefined,
    amountArs: updates.amountArs ?? undefined,
    stageId: updates.stageId,
    probability: updates.probability ?? undefined,
    expectedCloseDate: updates.expectedCloseDate ?? undefined,
    closedAt: updates.closedAt ?? undefined,
    lostReason: updates.lostReason ?? undefined,
    notes: updates.notes ?? undefined,
  })
}

export async function convertCurrencyAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): Promise<number> {
  return convertAmount(amount, fromCurrency, toCurrency)
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const companies = await getAllCompanies()
  return companies.find(company => company.id === id) || null
}

export async function getContactById(id: string): Promise<Contact | null> {
  const contacts = await getAllContacts()
  return contacts.find(contact => contact.id === id) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers()
  return users.find(user => user.id === id) || null
}
