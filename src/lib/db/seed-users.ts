import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "./index";
import * as schema from "./schema";
import { seedCompanies, seedContacts, seedDeals } from "./seed";

const USERS_DATA = [
  // Nivel 1 - CEO
  {
    email: "lucas.palazzo@crm.com",
    password: "SecurePass123!",
    name: "Lucas Palazzo",
    role: "CEO",
    level: 1,
    managerId: null,
    teamId: null,
  },
  // Nivel 2 - Managers
  {
    email: "juan.perez@crm.com",
    password: "SecurePass123!",
    name: "Juan Pérez",
    role: "Gerente de Ventas",
    level: 2,
    managerId: null, // Se establecerá después de crear a Lucas
    teamId: null, // Se establecerá después de obtener el team ID
  },
  {
    email: "ana.martinez@crm.com",
    password: "SecurePass123!",
    name: "Ana Martínez",
    role: "Gerente Comercial",
    level: 2,
    managerId: null,
    teamId: null,
  },
  // Nivel 3 - Vendedores Senior
  {
    email: "maria.garcia@crm.com",
    password: "SecurePass123!",
    name: "María García",
    role: "Vendedor Senior",
    level: 3,
    managerId: null, // Se establecerá después de crear a Juan
    teamId: null,
  },
  {
    email: "pedro.rodriguez@crm.com",
    password: "SecurePass123!",
    name: "Pedro Rodríguez",
    role: "Vendedor Senior",
    level: 3,
    managerId: null, // Se establecerá después de crear a Ana
    teamId: null,
  },
  // Nivel 4 - Vendedores Junior
  {
    email: "carlos.lopez@crm.com",
    password: "SecurePass123!",
    name: "Carlos López",
    role: "Vendedor Junior",
    level: 4,
    managerId: null, // Se establecerá después de crear a Juan
    teamId: null,
  },
  {
    email: "laura.sanchez@crm.com",
    password: "SecurePass123!",
    name: "Laura Sánchez",
    role: "Vendedor Junior",
    level: 4,
    managerId: null, // Se establecerá después de crear a Ana
    teamId: null,
  },
];

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  level: number;
  managerId: string | null;
  teamId: string | null;
}

async function createUser(userData: CreateUserData) {
  try {
    await auth.api.createUser({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        data: {
          role: userData.role,
          level: userData.level,
          managerId: userData.managerId,
          teamId: userData.teamId,
        },
      },
    });

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, userData.email))
      .limit(1);

    if (!user) {
      throw new Error(`Failed to create user ${userData.email}`);
    }

    return user;
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error);
    throw error;
  }
}

export async function seedUsers() {
  console.log("👥 Seeding users...\n");

  try {
    // Verificar si ya existen usuarios
    const existingUsers = await db.select().from(schema.users);

    if (existingUsers.length > 0) {
      console.log("⚠️  Users already exist. Skipping user seeding.");
      console.log(`   Found ${existingUsers.length} existing users`);
      return;
    }

    // Obtener teams
    const [ventasTeam] = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.name, "Ventas"))
      .limit(1);

    const [comercialTeam] = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.name, "Comercial"))
      .limit(1);

    if (!ventasTeam || !comercialTeam) {
      throw new Error("Teams not found. Please run db:seed first.");
    }

    console.log("📋 Teams found:");
    console.log(`   - Ventas: ${ventasTeam.id}`);
    console.log(`   - Comercial: ${comercialTeam.id}\n`);

    // Crear usuarios y guardar referencias
    const createdUsers: Record<string, any> = {};

    // 1. Crear CEO (Lucas Palazzo)
    console.log("1️⃣  Creating CEO...");
    createdUsers.lucas = await createUser({
      ...USERS_DATA[0],
      teamId: ventasTeam.id,
    });
    console.log(`   ✓ ${createdUsers.lucas.name} (${createdUsers.lucas.email})\n`);

    // 2. Crear Managers (Juan y Ana)
    console.log("2️⃣  Creating Managers...");
    createdUsers.juan = await createUser({
      ...USERS_DATA[1],
      managerId: createdUsers.lucas.id,
      teamId: ventasTeam.id,
    });
    console.log(`   ✓ ${createdUsers.juan.name} (${createdUsers.juan.email})`);

    createdUsers.ana = await createUser({
      ...USERS_DATA[2],
      managerId: createdUsers.lucas.id,
      teamId: comercialTeam.id,
    });
    console.log(`   ✓ ${createdUsers.ana.name} (${createdUsers.ana.email})\n`);

    // 3. Crear Vendedores Senior (María y Pedro)
    console.log("3️⃣  Creating Senior Sales...");
    createdUsers.maria = await createUser({
      ...USERS_DATA[3],
      managerId: createdUsers.juan.id,
      teamId: ventasTeam.id,
    });
    console.log(`   ✓ ${createdUsers.maria.name} (${createdUsers.maria.email})`);

    createdUsers.pedro = await createUser({
      ...USERS_DATA[4],
      managerId: createdUsers.ana.id,
      teamId: comercialTeam.id,
    });
    console.log(`   ✓ ${createdUsers.pedro.name} (${createdUsers.pedro.email})\n`);

    // 4. Crear Vendedores Junior (Carlos y Laura)
    console.log("4️⃣  Creating Junior Sales...");
    createdUsers.carlos = await createUser({
      ...USERS_DATA[5],
      managerId: createdUsers.juan.id,
      teamId: ventasTeam.id,
    });
    console.log(`   ✓ ${createdUsers.carlos.name} (${createdUsers.carlos.email})`);

    createdUsers.laura = await createUser({
      ...USERS_DATA[6],
      managerId: createdUsers.ana.id,
      teamId: comercialTeam.id,
    });
    console.log(`   ✓ ${createdUsers.laura.name} (${createdUsers.laura.email})\n`);

    // 5. Actualizar líderes de equipo
    console.log("5️⃣  Updating team leaders...");

    // Asignar Juan como líder del equipo de Ventas
    await db
      .update(schema.teams)
      .set({ leaderId: createdUsers.juan.id })
      .where(eq(schema.teams.id, ventasTeam.id));
    console.log(`   ✓ Juan Pérez assigned as Ventas team leader`);

    // Asignar Ana como líder del equipo Comercial
    await db
      .update(schema.teams)
      .set({ leaderId: createdUsers.ana.id })
      .where(eq(schema.teams.id, comercialTeam.id));
    console.log(`   ✓ Ana Martínez assigned as Comercial team leader\n`);

    console.log("✅ Users seeded successfully!\n");
    console.log("📊 Hierarchy structure:");
    console.log(`
    Lucas Palazzo (CEO - Level 1) [No Team]
    ├── Juan Pérez (Gerente de Ventas - Level 2) [Ventas - LEADER]
    │   ├── María García (Vendedor Senior - Level 3) [Ventas]
    │   └── Carlos López (Vendedor Junior - Level 4) [Ventas]
    └── Ana Martínez (Gerente Comercial - Level 2) [Comercial - LEADER]
        ├── Pedro Rodríguez (Vendedor Senior - Level 3) [Comercial]
        └── Laura Sánchez (Vendedor Junior - Level 4) [Comercial]
    `);

    console.log("\n🔑 Login credentials (all users have the same password):");
    console.log("   Password: SecurePass123!\n");

    console.log("🏢 Seeding companies, contacts, and deals...\n");

    const companies = await seedCompanies(createdUsers.lucas.id);

    if (companies) {
      const userIdsArray = [
        createdUsers.juan.id,
        createdUsers.ana.id,
        createdUsers.maria.id,
      ];

      const companyIdsArray = companies.map((c: any) => c.id);

      const contacts = await seedContacts(userIdsArray, companyIdsArray);

      if (contacts) {
        const dealStages = await db.select().from(schema.dealStages);
        const stageIdsArray = dealStages.map((s) => s.id);

        const [latestExchangeRate] = await db
          .select()
          .from(schema.exchangeRates)
          .orderBy(schema.exchangeRates.createdAt)
          .limit(1);

        const contactIdsArray = contacts.map((c: any) => c.id);

        await seedDeals(
          userIdsArray,
          contactIdsArray,
          companyIdsArray,
          stageIdsArray,
          latestExchangeRate.id
        );
      }
    }

    return createdUsers;
  } catch (error) {
    console.error("\n❌ Error seeding users:", error);
    throw error;
  }
}

if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("\n👋 User seed script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      process.exit(1);
    });
}
