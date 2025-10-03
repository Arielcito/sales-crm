import "dotenv/config";
import { db } from "./index";
import * as schema from "./schema";

type CompanyRecord = typeof schema.companies.$inferSelect;
type ContactRecord = typeof schema.contacts.$inferSelect;

const DEFAULT_DEAL_STAGES = [
  {
    name: "Oportunidad identificada",
    order: 1,
    color: "#3b82f6",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Cotización generada y enviada",
    order: 2,
    color: "#8b5cf6",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Aprobación pendiente",
    order: 3,
    color: "#f59e0b",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Orden de compra generada",
    order: 4,
    color: "#10b981",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Anticipo pagado",
    order: 5,
    color: "#06b6d4",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Proyectos en curso",
    order: 6,
    color: "#6366f1",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Facturación final",
    order: 7,
    color: "#8b5cf6",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Proyectos terminados",
    order: 8,
    color: "#22c55e",
    isDefault: true,
    isActive: true,
  },
  {
    name: "Proyectos perdidos",
    order: 9,
    color: "#ef4444",
    isDefault: true,
    isActive: true,
  },
];

const DEFAULT_EXCHANGE_RATES = [
  {
    date: "2025-01-01",
    usdToArs: "1050.00",
    source: "manual",
  },
  {
    date: new Date().toISOString().split('T')[0],
    usdToArs: "1100.00",
    source: "manual",
  },
];

const DEFAULT_TEAMS = [
  {
    name: "Ventas",
    description: "Equipo principal de ventas",
  },
  {
    name: "Comercial",
    description: "Equipo comercial y desarrollo de negocios",
  },
];

const DEFAULT_COMPANIES = [
  {
    name: "TechCorp Argentina S.A.",
    email: "contacto@techcorp.com.ar",
    phone: "+54 11 4567-8900",
    website: "https://techcorp.com.ar",
    address: "Av. Corrientes 1234, CABA, Argentina",
    industry: "Tecnología",
    employeeCount: 150,
    notes: "Cliente potencial en sector tecnológico",
  },
  {
    name: "Comercial del Sur",
    email: "info@comercialsur.com",
    phone: "+54 341 456-7890",
    website: "https://comercialdelsur.com",
    address: "San Martín 567, Rosario, Santa Fe",
    industry: "Retail",
    employeeCount: 45,
    notes: "Empresa de retail con interés en soluciones CRM",
  },
  {
    name: "Industrias del Norte S.R.L.",
    email: "ventas@industriasnorte.com",
    phone: "+54 381 234-5678",
    website: "https://industriasnorte.com",
    address: "Ruta 9 Km 1234, Tucumán",
    industry: "Manufactura",
    employeeCount: 200,
    notes: "Empresa manufacturera, oportunidad de automatización",
  },
  {
    name: "Servicios Profesionales BA",
    email: "contacto@spba.com",
    phone: "+54 11 5432-1098",
    website: "https://spba.com",
    address: "Av. Santa Fe 2345, CABA, Argentina",
    industry: "Consultoría",
    employeeCount: 30,
    notes: "Consultora interesada en herramientas de gestión",
  },
];

export async function seedDealStages() {
  console.log("🌱 Seeding deal stages...");

  try {
    const existingStages = await db.select().from(schema.dealStages);

    if (existingStages.length > 0) {
      console.log("✓ Deal stages already seeded");
      return;
    }

    await db.insert(schema.dealStages).values(DEFAULT_DEAL_STAGES);
    console.log(`✓ Inserted ${DEFAULT_DEAL_STAGES.length} default deal stages`);
  } catch (error) {
    console.error("✗ Error seeding deal stages:", error);
    throw error;
  }
}

export async function seedExchangeRates() {
  console.log("🌱 Seeding exchange rates...");

  try {
    const existingRates = await db.select().from(schema.exchangeRates);

    if (existingRates.length > 0) {
      console.log("✓ Exchange rates already seeded");
      return;
    }

    await db.insert(schema.exchangeRates).values(DEFAULT_EXCHANGE_RATES);
    console.log(`✓ Inserted ${DEFAULT_EXCHANGE_RATES.length} default exchange rates`);
  } catch (error) {
    console.error("✗ Error seeding exchange rates:", error);
    throw error;
  }
}

export async function seedTeams() {
  console.log("🌱 Seeding teams...");

  try {
    const existingTeams = await db.select().from(schema.teams);

    if (existingTeams.length > 0) {
      console.log("✓ Teams already seeded");
      return;
    }

    await db.insert(schema.teams).values(DEFAULT_TEAMS);
    console.log(`✓ Inserted ${DEFAULT_TEAMS.length} default teams`);
  } catch (error) {
    console.error("✗ Error seeding teams:", error);
    throw error;
  }
}

export async function seedCompanies(userId: string): Promise<CompanyRecord[]> {
  console.log("🌱 Seeding companies...");

  try {
    const existingCompanies = await db.select().from(schema.companies);

    if (existingCompanies.length > 0) {
      console.log("✓ Companies already seeded");
      return existingCompanies;
    }

    const companiesWithUser = DEFAULT_COMPANIES.map(company => ({
      ...company,
      createdBy: userId,
    }));

    const insertedCompanies = await db.insert(schema.companies).values(companiesWithUser).returning();
    console.log(`✓ Inserted ${insertedCompanies.length} default companies`);
    return insertedCompanies;
  } catch (error) {
    console.error("✗ Error seeding companies:", error);
    throw error;
  }
}

export async function seedContacts(userIds: string[], companyIds: string[]): Promise<ContactRecord[]> {
  console.log("🌱 Seeding contacts...");

  try {
    const existingContacts = await db.select().from(schema.contacts);

    if (existingContacts.length > 0) {
      console.log("✓ Contacts already seeded");
      return existingContacts;
    }

    const DEFAULT_CONTACTS = [
      {
        userId: userIds[0],
        companyId: companyIds[0],
        name: "Roberto Fernández",
        email: "rfernandez@techcorp.com.ar",
        phone: "+54 11 4567-8901",
        position: "CTO",
        status: "lead",
        notes: "Contacto técnico principal, interesado en integración",
      },
      {
        userId: userIds[0],
        companyId: companyIds[0],
        name: "María González",
        email: "mgonzalez@techcorp.com.ar",
        phone: "+54 11 4567-8902",
        position: "Gerente de Compras",
        status: "qualified",
        notes: "Decisor final de compras",
      },
      {
        userId: userIds[1],
        companyId: companyIds[1],
        name: "Carlos Ruiz",
        email: "cruiz@comercialsur.com",
        phone: "+54 341 456-7891",
        position: "Director General",
        status: "qualified",
        notes: "CEO interesado en digitalización",
      },
      {
        userId: userIds[2],
        companyId: companyIds[2],
        name: "Lucía Morales",
        email: "lmorales@industriasnorte.com",
        phone: "+54 381 234-5679",
        position: "Jefa de Operaciones",
        status: "lead",
        notes: "Buscando soluciones de automatización",
      },
      {
        userId: userIds[1],
        companyId: companyIds[3],
        name: "Diego Sánchez",
        email: "dsanchez@spba.com",
        phone: "+54 11 5432-1099",
        position: "Socio Fundador",
        status: "customer",
        notes: "Cliente activo, posible expansión de servicios",
      },
    ];

    const insertedContacts = await db.insert(schema.contacts).values(DEFAULT_CONTACTS).returning();
    console.log(`✓ Inserted ${insertedContacts.length} default contacts`);
    return insertedContacts;
  } catch (error) {
    console.error("✗ Error seeding contacts:", error);
    throw error;
  }
}

export async function seedDeals(userIds: string[], contactIds: string[], companyIds: string[], stageIds: string[], exchangeRateId: string): Promise<void> {
  console.log("🌱 Seeding deals...");

  try {
    const existingDeals = await db.select().from(schema.deals);

    if (existingDeals.length > 0) {
      console.log("✓ Deals already seeded");
      return;
    }

    const DEFAULT_DEALS = [
      {
        userId: userIds[0],
        contactId: contactIds[0],
        companyId: companyIds[0],
        title: "Implementación CRM Corporativo",
        currency: "USD",
        amountUsd: "45000.00",
        amountArs: "49500000.00",
        exchangeRateId: exchangeRateId,
        stageId: stageIds[2],
        probability: 70,
        expectedCloseDate: new Date("2025-03-15"),
        notes: "Proyecto grande, requiere customización",
      },
      {
        userId: userIds[1],
        contactId: contactIds[2],
        companyId: companyIds[1],
        title: "Sistema de gestión de ventas",
        currency: "ARS",
        amountUsd: null,
        amountArs: "8500000.00",
        exchangeRateId: null,
        stageId: stageIds[1],
        probability: 50,
        expectedCloseDate: new Date("2025-02-28"),
        notes: "Interesados en módulo de inventario",
      },
      {
        userId: userIds[2],
        contactId: contactIds[3],
        companyId: companyIds[2],
        title: "Automatización de procesos",
        currency: "USD",
        amountUsd: "28000.00",
        amountArs: "30800000.00",
        exchangeRateId: exchangeRateId,
        stageId: stageIds[0],
        probability: 30,
        expectedCloseDate: new Date("2025-04-30"),
        notes: "Primera reunión programada",
      },
      {
        userId: userIds[1],
        contactId: contactIds[4],
        companyId: companyIds[3],
        title: "Expansión servicio CRM",
        currency: "USD",
        amountUsd: "15000.00",
        amountArs: "16500000.00",
        exchangeRateId: exchangeRateId,
        stageId: stageIds[5],
        probability: 90,
        expectedCloseDate: new Date("2025-02-15"),
        notes: "Cliente existente, renovación anual",
      },
      {
        userId: userIds[0],
        contactId: contactIds[1],
        companyId: companyIds[0],
        title: "Módulo de reporting avanzado",
        currency: "USD",
        amountUsd: "12000.00",
        amountArs: "13200000.00",
        exchangeRateId: exchangeRateId,
        stageId: stageIds[7],
        probability: 100,
        expectedCloseDate: new Date("2025-01-31"),
        closedAt: new Date("2025-01-28"),
        notes: "Proyecto completado exitosamente",
      },
    ];

    await db.insert(schema.deals).values(DEFAULT_DEALS);
    console.log(`✓ Inserted ${DEFAULT_DEALS.length} default deals`);
  } catch (error) {
    console.error("✗ Error seeding deals:", error);
    throw error;
  }
}

export async function seedAll() {
  console.log("🌱 Starting database seeding...\n");

  try {
    await seedTeams();
    await seedDealStages();
    await seedExchangeRates();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("⚠️  Note: Run 'npm run db:seed-users' after this to create users, companies, contacts, and deals");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedAll()
    .then(() => {
      console.log("\n👋 Seed script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      process.exit(1);
    });
}
