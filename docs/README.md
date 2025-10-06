# 📚 Shipsy Documentation

Welcome to the Shipsy project documentation. This directory contains comprehensive technical documentation for developers, testers, and maintainers.

---

## 📖 Documentation Index

### 🏗️ Architecture Documentation

| Document | Description | Includes |
|----------|-------------|----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Complete application architecture, design patterns, and technology stack | ![Architecture Diagram](./architecture.png) |

### 🗄️ Database Documentation

| Document | Description | Includes |
|----------|-------------|----------|
| **[DbSchema.md](./DbSchema.md)** | Complete database schema reference with SQL, Drizzle definitions, indexes, and query patterns | ![Database ERD](./dbschema.png) |
| **[database-erd.md](./database-erd.md)** | Interactive Mermaid ERD diagrams with visual relationships and data flow | Interactive diagrams |
| **[QuickReference.md](./QuickReference.md)** | Print-friendly quick reference card for database schema | Cheat sheet |

### 📝 Development History

| Document | Description | Includes |
|----------|-------------|----------|
| **[commit.md](./commit.md)** | Complete commit history with visual git logs and development timeline | ![Git Log 1](./git-log-1.png) ![Git Log 2](./git-log-2.png) ![Git Log 3](./git-log-3.png) |

### 🧪 Testing Documentation

| Document | Description | Best For |
|----------|-------------|----------|
| **[TEST_SUITE_COMPLETE.md](./TEST_SUITE_COMPLETE.md)** | Comprehensive test suite documentation with 156+ test cases | QA Engineers, Testers |
| **[EDIT_FUNCTIONALITY_FIX.md](./EDIT_FUNCTIONALITY_FIX.md)** | Edit form bug fixes and implementation details | Frontend Developers |

### � Technical Documentation

| Document | Description | Best For |
|----------|-------------|----------|
| **[TechnicalDocumentation.md](./TechnicalDocumentation.md)** | Complete technical specs, architecture, modules, problem statement, and implementation guide | Developers, Architects, New Team Members |

### 🔌 API Documentation

| Document | Description | Best For |
|----------|-------------|----------|
| **[API.md](./API.md)** | Complete REST API reference with all 20+ endpoints, request/response examples, error codes | API Developers, Integration Engineers |
| **[POSTMAN.md](../POSTMAN.md)** | Postman collection guide with 24 API endpoints | API Testing, Integration |

---

## 🗄️ Database Schema Overview

### Entity Summary

```
┌─────────────────────────────────────────────────────┐
│                   👤 USERS (7 cols)                  │
│              Shop Owners/Business Accounts           │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │ CASCADE DELETE        │ CASCADE DELETE
        ▼                       ▼
┌───────────────┐       ┌───────────────────────────┐
│ 👥 CUSTOMERS  │       │   📦 SHIPMENTS (13 cols)  │
│   (8 cols)    │───────│   Order Tracking System   │
│ End Customers │ 1:N   │                           │
└───────────────┘RESTRICT└───────────────────────────┘
```

### Tables at a Glance

| Table | Records | Key Indexes | Critical Fields |
|-------|---------|-------------|-----------------|
| **users** | Shop owners | email, phone | email (unique), password_hash |
| **customers** | End customers | user_id, phone, email | user_id (FK), address |
| **shipments** | Orders | 8 indexes (3 composite) | type, mode, is_delivered, cost |

### Enums

- **shipment_type:** `LOCAL` \| `NATIONAL` \| `INTERNATIONAL`
- **shipment_mode:** `LAND` \| `AIR` \| `WATER`

---

## 🧪 Testing Coverage

### Test Suite Statistics

```
📊 Test Coverage Summary
├── 🧱 Unit Tests: 3 files
│   ├── auth.validator.test.ts (25+ tests)
│   ├── customer.validator.test.ts (20+ tests)
│   └── shipment.validator.test.ts (30+ tests)
│
├── 🔗 Integration Tests: 3 files
│   ├── customers.test.ts (30+ tests)
│   ├── shipments.test.ts (35+ tests)
│   └── security.test.ts (8+ tests)
│
└── 🎯 E2E Tests: 3 files
    ├── auth-flow.test.ts (5+ tests)
    ├── customer-flow.test.ts (3+ tests)
    └── shipment-flow.test.ts (5+ tests)

Total: 156+ Test Cases
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- auth.validator.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 🔌 API Endpoints

### Quick Reference

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Authentication** | 7 endpoints | Partial |
| **Customers** | 9 endpoints | Yes |
| **Shipments** | 10 endpoints | Yes |

### Postman Collection

Import the **Shipsy-API.postman_collection.json** file for:
- ✅ Pre-configured requests
- ✅ Environment variables
- ✅ Test scripts
- ✅ Example responses

See [POSTMAN.md](../POSTMAN.md) for detailed instructions.

---

## 🚀 Quick Start Guide

### 1. Database Setup

```bash
# Create .env file
cp sample.env .env

# Edit DATABASE_URL in .env
# Add your Neon PostgreSQL connection string

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Open Drizzle Studio
npm run db:studio
```

### 2. Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 3. Testing

```bash
# Install test dependencies (if not already installed)
npm install

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 📊 Database Statistics Queries

### User Statistics

```sql
-- Total customers per user
SELECT u.name, COUNT(c.id) as customer_count
FROM users u
LEFT JOIN customers c ON u.id = c.user_id
GROUP BY u.id, u.name;

-- Total shipments per user
SELECT u.name, COUNT(s.id) as shipment_count
FROM users u
LEFT JOIN shipments s ON u.id = s.user_id
GROUP BY u.id, u.name;
```

### Shipment Analytics

```sql
-- Delivery rate
SELECT 
  COUNT(*) as total_shipments,
  SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as delivery_rate
FROM shipments;

-- Revenue by shipment type
SELECT 
  type,
  COUNT(*) as total_shipments,
  SUM(calculated_total::numeric) as revenue
FROM shipments
WHERE is_delivered = true
GROUP BY type
ORDER BY revenue DESC;
```

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bierner.markdown-mermaid",
    "drizzle-team.drizzle-orm",
    "Postman.postman-for-vscode"
  ]
}
```

### Database Tools

- **Drizzle Studio:** Built-in visual database browser (`npm run db:studio`)
- **pgAdmin:** Full-featured PostgreSQL client
- **TablePlus:** Modern database GUI

### API Testing

- **Postman:** Import collection from `Shipsy-API.postman_collection.json`
- **Thunder Client:** VS Code extension for API testing
- **curl:** Command-line HTTP client

---

## 📁 Project Structure

```
shipsy/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── customers/       # Customer CRUD
│   │   └── shipments/       # Shipment CRUD
│   └── (pages)/             # Frontend pages
│
├── components/               # React components
│   ├── customers/           # Customer components
│   ├── shipments/           # Shipment components
│   └── ui/                  # Reusable UI components
│
├── lib/                     # Backend logic
│   ├── controllers/         # Request handlers
│   ├── db/                  # Database setup
│   │   ├── schema.ts        # Drizzle schema
│   │   ├── migrate.ts       # Migration runner
│   │   └── seed.ts          # Seed script
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic
│   ├── utils/               # Utilities
│   └── validators/          # Input validation
│
├── tests/                   # Test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/                # End-to-end tests
│   └── helpers/            # Test utilities
│
├── docs/                   # 📚 Documentation (you are here)
│   ├── README.md           # This file
│   ├── DbSchema.md         # Database schema
│   ├── database-erd.md     # ERD diagrams
│   ├── TEST_SUITE_COMPLETE.md
│   └── EDIT_FUNCTIONALITY_FIX.md
│
└── drizzle/                # Database migrations
    └── 0000_nervous_chimera.sql
```

---

## 🔐 Security Best Practices

### Authentication

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens stored in httpOnly cookies
- ✅ Access token: 4 hours expiry
- ✅ Refresh token: 15 days expiry

### API Security

- ✅ Route protection with middleware
- ✅ User data isolation (can only access own data)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention via Drizzle ORM

### Database Security

- ✅ Foreign key constraints
- ✅ Unique constraints on email
- ✅ NOT NULL constraints on required fields
- ✅ Cascade delete rules for data integrity

---

## 📝 Contributing Guidelines

### Code Style

- TypeScript strict mode
- ESLint + Prettier configuration
- Component-based architecture
- Repository pattern for data access

### Commit Messages

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(customers): Add search functionality"
git commit -m "fix(auth): Resolve token refresh issue"
git commit -m "docs(database): Update schema documentation"
git commit -m "test(shipments): Add integration tests"
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Update documentation if needed
5. Submit PR with clear description

---

## 🐛 Troubleshooting

### Database Issues

**Problem:** `DATABASE_URL not found`
```bash
# Solution: Create .env file
cp sample.env .env
# Add your Neon PostgreSQL connection string
```

**Problem:** Migration fails
```bash
# Solution: Drop and recreate database
npm run db:migrate
```

### Test Issues

**Problem:** Tests failing with module errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

### Development Server Issues

**Problem:** Port already in use
```bash
# Solution: Change port or kill process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Additional Resources

### Official Documentation

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev/
- **Drizzle ORM:** https://orm.drizzle.team/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Neon:** https://neon.tech/docs/introduction
- **Jest:** https://jestjs.io/docs/getting-started

### Learning Resources

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Testing Best Practices:** https://testingjavascript.com/
- **API Design:** https://restfulapi.net/

---

## 📞 Support

For questions or issues:
1. Check existing documentation in `/docs`
2. Review test files for usage examples
3. Check Postman collection for API examples
4. Review code comments in source files

---

**Last Updated:** October 6, 2025  
**Version:** 1.0.0  
**Maintained By:** Shipsy Development Team

---

<div align="center">

**[⬆ Back to Top](#-shipsy-documentation)**

Made with ❤️ by the Shipsy Team

</div>
