# 📝 Shipsy Commit History

## Git Log Overview

This document provides a visual overview of the Shipsy project's commit history, showing the development timeline and major features implemented.

---

## Recent Commits (Visual)

### Part 1: Latest Commits - Tests & Deployment
![Git Log Part 1](./git-log-1.png)

**Key Commits:**
- `3d35637` - Add Tests Unit, Integration, E2E
- `65a2f36` - Postman collection
- `86f3668` - UI pages updated with new loader
- `c6f3523` - Env error message added
- `ee9e8ed` - DB Seed File added
- `1f3ab76` - Delete redundant routes
- `fa4b9fc` - Update shipment component and add auth validations
- `d5e623e` - All controllers inlined
- `816eec1` - Create auth utility and update hooks
- `6dee0dd` - Frontend validators added
- `9ab79f3` - Deployment setup done

---

### Part 2: Feature Development - Components & Pages
![Git Log Part 2](./git-log-2.png)

**Key Commits:**
- `54fa96b` - Frontend validators added
- `9ab79f3` - Deployment setup done
- `aef29d9` - Update markdown
- `acf59d3` - Metadata updates
- `8798a33` - Add customer and dashboard page
- `1ae8a4b` - All Feature components added
- `addd8be` - Layout components added
- `aaf4a1b` - Base components added
- `e8d44bb` - Add shipments page
- `43cc057` - Add register and profile page
- `178e5d3` - Add Login page
- `c9fbb38` - Update base class functions
- `ef403c8` - Layout updated
- `8fcc9cc` - Todo.md updated
- `4aacc9b` - Add custom hooks

---

### Part 3: Backend Development - Architecture & Setup
![Git Log Part 3](./git-log-3.png)

**Key Commits:**
- `3ec1565` - Update routes
- `4fac6e3` - Create Shipment routes
- `8953bd4` - Create Customer routes
- `cb7cfe7` - Create Auth routes
- `3c369f1` - Type issues resolved
- `b5a68f7` - Controllers created
- `5891c5f` - Progress doc so far
- `b91eb3f` - Zod jwt and bcrypt added with types
- `b335a18` - Create service classes
- `4425c1` - Create data models
- `c6557c5` - Utils created
- `b75a8cd` - Progress tracking
- `5166b2f` - TS types created
- `2012883` - Data access layer implemented
- `1d3a8a` - Validators created
- `a5829d7` - DB schema migrations complete
- `202aef` - DB migration and drizzle config
- `52eab43` - DB setup and schema creation with indexes
- `b4239c1` - Project init
- `721670e` - Initial commit from Create Next App

---

## Development Timeline

### Phase 1: Project Setup (Initial)
- Project initialization with Next.js 15
- TypeScript configuration
- Database setup with Drizzle ORM and PostgreSQL

### Phase 2: Backend Architecture (Commits: b4239c1 - 1d3a8a)
- Data access layer implementation
- Type definitions and validators
- Database schema with migrations
- Service layer creation
- Model classes implementation

### Phase 3: API Development (Commits: cb7cfe7 - 3ec1565)
- Authentication routes (login, register, logout)
- Customer CRUD routes
- Shipment CRUD routes
- Controller implementations

### Phase 4: Frontend Development (Commits: 178e5d3 - 1ae8a4b)
- Login and register pages
- Dashboard implementation
- Customer management UI
- Shipment tracking UI
- Layout components (Navbar, Sidebar)
- Base UI components (Button, Input, etc.)
- Custom React hooks

### Phase 5: Integration & Validation (Commits: 6dee0dd - fa4b9fc)
- Frontend validators
- Authentication utilities
- Component updates with validations
- Metadata management

### Phase 6: Testing & Documentation (Commits: 3d35637 - Latest)
- Comprehensive test suite (Unit, Integration, E2E)
- Postman API collection
- Database seed data
- Environment error handling
- UI/UX improvements

---

## Commit Statistics

| Category | Count | Description |
|----------|-------|-------------|
| **Total Commits** | 40+ | Complete development history |
| **Backend Commits** | 15+ | API, services, models, database |
| **Frontend Commits** | 12+ | Pages, components, hooks |
| **Testing Commits** | 4+ | Unit, integration, E2E tests |
| **DevOps Commits** | 5+ | Deployment, config, documentation |
| **Bug Fixes** | 4+ | Error handling, validation fixes |

---

## Key Milestones

### 🎯 Milestone 1: Backend Foundation
- **Commits:** b4239c1 to b5a68f7
- **Features:** Database schema, models, services, repositories

### 🎯 Milestone 2: API Development
- **Commits:** cb7cfe7 to 4fac6e3
- **Features:** Complete REST API with auth, customers, shipments

### 🎯 Milestone 3: Frontend Development
- **Commits:** 178e5d3 to 1ae8a4b
- **Features:** All pages, components, and UI elements

### 🎯 Milestone 4: Testing & Quality
- **Commits:** 3d35637
- **Features:** 156+ test cases, Postman collection

---

## Branch Information

- **Main Branch:** `main`
- **Repository:** itsaryankaushik/Shipsy
- **Development Model:** Trunk-based development

---

## Contributing

To view the full commit history:

```bash
# View all commits with details
git log --oneline --graph --decorate --all

# View commits with file changes
git log --stat

# View commits by author
git log --author="Your Name"

# View commits in date range
git log --since="2025-10-01" --until="2025-10-06"
```

---

**Last Updated:** October 6, 2025  
**Total Commits:** 40+  
**Repository:** [Shipsy by itsaryankaushik](https://github.com/itsaryankaushik/Shipsy)
