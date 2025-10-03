import { getAllDeals, updateDeal, convertAmount } from "./deal.service"
import { getAllCompanies } from "./company.service"
import { getAllContacts } from "./contact.service"
import { getAllUsers } from "./user.service"
import { getActivityLogsByDealId, createActivityLog } from "./activity.service"
import type { Deal, Company, Contact, User, Currency, DealStage } from "@/lib/types"

export class DataService {
  static async getDeals(userId?: string): Promise<Deal[]> {
    return getAllDeals({ userId })
  }

  static async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
    return updateDeal({
      id,
      title: updates.title,
      currency: updates.currency,
      amountUsd: updates.amountUsd,
      amountArs: updates.amountArs,
      stageId: updates.stageId,
      probability: updates.probability,
      expectedCloseDate: updates.expectedCloseDate,
      closedAt: updates.closedAt,
      lostReason: updates.lostReason,
      notes: updates.notes,
    })
  }

  static async convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): Promise<number> {
    return convertAmount(amount, fromCurrency, toCurrency)
  }

  static async getCompanyById(id: string): Promise<Company | null> {
    const companies = await getAllCompanies()
    return companies.find(company => company.id === id) || null
  }

  static async getContactById(id: string): Promise<Contact | null> {
    const contacts = await getAllContacts()
    return contacts.find(contact => contact.id === id) || null
  }

  static async getUserById(id: string): Promise<User | null> {
    const users = await getAllUsers()
    return users.find(user => user.id === id) || null
  }

  static async getActivityLogsByDealId(dealId: string) {
    return getActivityLogsByDealId(dealId)
  }

  static async addActivityLog(log: {
    deal_id: string
    user_id: string
    action: string
    old_value?: string
    new_value?: string
    notes?: string
  }) {
    return createActivityLog({
      dealId: log.deal_id,
      userId: log.user_id,
      action: log.action,
      details: log.notes || "",
      oldValue: log.old_value,
      newValue: log.new_value,
    })
  }
}
