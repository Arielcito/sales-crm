# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Common Tasks Quick Reference
- **🔍 Finding Code**: Use `Grep` for content search, `Glob` for file patterns, `Task` tool for complex searches
- **🛠️ Bug Fixes**: Search → Read → Test → Edit → Verify
- **✨ New Features**: Plan → Research → Implement → Test → Build → Document
- **🔄 Database Changes**: Generate migrations with `npm run db:generate`, push with `npm run db:push`

## Project Structure

This is a sales CRM application built with Next.js 14 using the App Router, featuring a modern frontend with TypeScript, Tailwind CSS, shadcn/ui components, Better Auth, Zod validation, and Drizzle ORM with PostgreSQL database through Next.js APIs.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type checking
```


## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Authentication**: Better Auth for secure user management
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for type-safe data validation
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **State Management**: React hooks and context
- **Data Fetching**: TanStack Query (React Query) - NEVER use useEffect for API calls
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Mono

### API Response Format

**Consistent response structure for Next.js API routes:**

```tsx
// Success response
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Example"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "There was an error processing the form",
    "details": [
      "Email is mandatory",
      "Password must have at least 8 characters"
    ]
  }
}

// Pagination response
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 10,
    "totalPages": 10
  }
}
```

#### Folder Structure

Domain-based organization following these patterns:

```
app/                              # Next.js App Router
├── (auth)/                       # Auth routes group
├── (protected)/                  # Protected routes group
│   ├── dashboard/                # Dashboard domain
│   ├── companies/                # Companies management
│   ├── users/                    # User management
│   ├── currency/                 # Currency settings
│   └── kanban/                   # Kanban board
├── api/                         # Next.js API routes
│   └── auth/                     # Auth API routes
└── page.tsx                      # Landing page

components/                       # Shared components
├── ui/                          # Base UI components (shadcn/ui)
├── layout/                      # Layout components
└── ...

lib/                             # Business logic
├── db/                          # Database configuration and schemas
├── auth.ts                      # Better Auth configuration
├── schemas/                     # Zod validation schemas
├── types.ts                     # TypeScript type definitions
├── utils.ts                     # Utility functions
└── ...
```

## Key Technologies

### Tech Stack
- **Framework**: Next.js 14 with App Router, React 18, TypeScript
- **Authentication**: Better Auth for secure user management
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for type-safe data validation
- **Styling**: Tailwind CSS with CSS variables and custom animations
- **UI Components**: Radix UI components via shadcn/ui (New York style)
- **Forms**: React Hook Form with Zod resolvers
- **State Management**: React hooks and context
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Mono
- **Date Handling**: date-fns
- **Analytics**: Vercel Analytics integration

## Development Guidelines

- Use npm as the package manager
- Use shadcn/ui components for consistent UI
- Implement TypeScript strict mode compliance
- Use Drizzle ORM for all database operations in API routes
- **Before creating a new component, always check if the same component already exists** to maximize reusability
- **Data MUST always be handled through hooks** - Never use useEffect for API calls
- **After creating a page, always create atomic components**
- **After creating a type/interface/enum, check if it already exists** - Use the proper type file
- **NEVER write comments**
- **Every time you write a log you MUST create a message that indicates what are you logging**

### API Route Structure

Next.js API routes should follow these patterns:

#### API Routes (`app/api/*/route.ts`)
- **Purpose**: Handle HTTP requests and database operations
- **Responsibilities**:
  - Validate request data with Zod schemas
  - Execute database queries using Drizzle ORM
  - Return consistent response format
  - Handle errors appropriately

#### Database Operations
- Use Drizzle ORM for all database queries
- Define schemas in `lib/db/schema.ts`
- Execute migrations with Drizzle Kit

#### Data Validation
- Use Zod schemas for request validation in API routes
- Define schemas in `lib/schemas/` directory
- Validate data at route level before processing

## Configuration Files

- **TypeScript**: `tsconfig.json` configured for Next.js 14
- **Tailwind**: Uses CSS variables and custom animations
- **shadcn/ui**: Configured with New York style and Lucide icons
- **Drizzle**: PostgreSQL configuration in `drizzle.config.ts`
- **Path Aliases**: `@/*` for imports

## Database Migrations

Use Drizzle Kit for schema management:
1. Update schema files in `lib/db/schema.ts`
2. Generate migrations: `npm run drizzle:generate`
3. Apply migrations: `npm run drizzle:push`

## Environment Setup

Application requires `.env.local` file with:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for Next.js authentication
- Additional auth-related variables for Better Auth configuration