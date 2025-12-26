# Local Development Setup Guide

This guide will help you set up the Real Estate Rental Pricing Launch Assistant on your local machine for development and testing.

## Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **pnpm** (v9 or higher): `npm install -g pnpm`
- **Git**: [Download](https://git-scm.com/)
- **MySQL/MariaDB** or **PostgreSQL** (for local database)

## Step 1: Clone the Repository

```bash
git clone https://github.com/tawooss/real-estate-launch-assistant.git
cd real-estate-launch-assistant
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- React 19 and TypeScript for frontend
- Express and tRPC for backend
- Drizzle ORM for database management
- Vitest for testing

## Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database connection (choose one)
DATABASE_URL=mysql://user:password@localhost:3306/real_estate_db
# OR for PostgreSQL:
DATABASE_URL=postgresql://user:password@localhost:5432/real_estate_db

# JWT for session management
JWT_SECRET=your-secret-key-here-min-32-chars

# Manus OAuth (pre-configured, no changes needed)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# Optional: Gemini API key (for external API testing)
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash-lite
```

## Step 4: Set Up Database

### Option A: MySQL (Local)

```bash
# Start MySQL server (macOS with Homebrew)
brew services start mysql

# Or on Linux:
sudo systemctl start mysql

# Create database
mysql -u root -p
> CREATE DATABASE real_estate_db;
> EXIT;
```

### Option B: PostgreSQL (Local)

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Or on Linux:
sudo systemctl start postgresql

# Create database
createdb real_estate_db
```

### Push Schema to Database

```bash
pnpm db:push
```

This command:
1. Generates migrations from your schema
2. Applies migrations to the database
3. Creates all required tables

## Step 5: Start Development Server

```bash
pnpm dev
```

The application will start at: **http://localhost:3000**

You should see:
- Frontend: React application
- Backend: Express server on port 3000
- Database: Connected and ready

## Step 6: Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/services/rag.test.ts

# Run with coverage
pnpm test --coverage
```

Expected output: **26+ tests passing**

## Project Structure

```
real-estate-launch-assistant/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   └── App.tsx           # Main app component
│   └── index.html
├── server/                    # Express backend
│   ├── routers/              # tRPC route handlers
│   │   ├── agent.ts          # Property analysis agent
│   │   └── agent.test.ts     # Agent tests
│   ├── services/
│   │   ├── rag.ts            # RAG service
│   │   └── rag.test.ts       # RAG tests
│   ├── db.ts                 # Database helpers
│   ├── db.crud.ts            # CRUD operations
│   ├── db.crud.test.ts       # Database tests
│   └── _core/                # Framework internals
├── drizzle/
│   ├── schema.ts             # Database schema
│   └── migrations/           # Auto-generated migrations
├── shared/                   # Shared types and constants
├── package.json
├── tsconfig.json
└── README.md
```

## Common Development Tasks

### Add a New Feature

1. **Update database schema** (if needed):
   ```bash
   # Edit drizzle/schema.ts
   pnpm db:push
   ```

2. **Create database helper** in `server/db.ts`:
   ```ts
   export async function getFeatureData(id: number) {
     const db = await getDb();
     return db.select().from(features).where(eq(features.id, id));
   }
   ```

3. **Add tRPC procedure** in `server/routers.ts`:
   ```ts
   feature: protectedProcedure
     .input(z.object({ id: z.number() }))
     .query(({ input }) => getFeatureData(input.id)),
   ```

4. **Create React component** in `client/src/pages/Feature.tsx`:
   ```tsx
   const { data } = trpc.feature.useQuery({ id: 1 });
   ```

5. **Write tests** in `server/routers/feature.test.ts`

### Debug Issues

**Database connection fails:**
```bash
# Check database is running
mysql -u root -p -e "SELECT 1;"

# Check environment variables
cat .env | grep DATABASE_URL

# Reset migrations
rm -rf drizzle/migrations/*
pnpm db:push
```

**Frontend not loading:**
```bash
# Clear cache
rm -rf node_modules/.vite

# Restart dev server
pnpm dev
```

**Tests failing:**
```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run single test file
pnpm test server/routers/agent.test.ts
```

## Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database migration fails
```bash
# Check schema for errors
pnpm db:push --verbose

# Reset database (WARNING: deletes data)
mysql -u root -p real_estate_db < /dev/null
pnpm db:push
```

### Tests timeout
```bash
# Increase timeout in vitest.config.ts
# Default is 10000ms (10 seconds)
```

## Next Steps

1. **Explore the codebase**: Start with `README.md` for architecture overview
2. **Run the application**: Follow steps 1-5 above
3. **Test the agent**: Submit a property analysis through the UI
4. **Review tests**: Check `server/**/*.test.ts` to understand test patterns
5. **Modify and extend**: Add features following the patterns in the codebase

## Support

For issues or questions:
- Check the README.md for API documentation
- Review test files for usage examples
- Check git history: `git log --oneline`

## Git Workflow

```bash
# Create a new branch for features
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Database connection string | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Session signing key | `your-secret-key-min-32-chars` |
| `GEMINI_API_KEY` | External Gemini API key | `AIza...` |
| `GEMINI_MODEL` | Gemini model version | `gemini-2.0-flash-lite` |
| `VITE_APP_ID` | Manus OAuth app ID | `your-app-id` |

---

**Happy coding!** 🚀
