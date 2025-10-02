# Sales CRM

A modern, feature-rich CRM application built with cutting-edge technologies.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and TypeScript
- **Authentication**: [Better Auth](https://better-auth.com/) - Modern, secure authentication
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Form Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query) v5

## Features

- 🔐 **Secure Authentication** - Email/password and OAuth support
- 👥 **Contact Management** - Track and manage customer relationships
- 💼 **Deal Pipeline** - Monitor sales opportunities and stages
- 📊 **Dashboard** - Overview of sales activities and metrics
- 🎨 **Modern UI** - Beautiful, responsive interface with dark mode support
- ⚡ **Fast & Optimized** - Built on Next.js 15 with Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Arielcito/sales-crm.git
cd sales-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string
- `BETTER_AUTH_SECRET` - A random secret key
- Other optional OAuth credentials

4. Generate and push database schema:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   └── page.tsx         # Landing page
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configurations
│   ├── db/             # Database schema and client
│   ├── schemas/        # Zod validation schemas
│   ├── auth.ts         # Better Auth server config
│   ├── auth-client.ts  # Better Auth client
│   └── utils.ts        # Utility functions
└── providers/          # React context providers
```

## Database Schema

The application includes tables for:
- **Users** - User accounts
- **Sessions** - Active sessions
- **Accounts** - OAuth accounts
- **Verifications** - Email verifications
- **Contacts** - Customer contacts
- **Deals** - Sales opportunities

## Authentication

Better Auth provides:
- Email/password authentication
- OAuth providers (GitHub configured, others can be added)
- Session management
- Email verification
- Password reset

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
