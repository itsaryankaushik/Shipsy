# 🏗️ Shipsy Application Architecture

![Shipsy Architecture Diagram](./architecture.png)

## 📋 Overview

Shipsy is a full-stack shipment management system built with modern web technologies. This document provides a comprehensive overview of the application architecture, design patterns, and technology stack.

**Architecture Pattern:** Layered Architecture (MVC-inspired)  
**Application Type:** Server-Side Rendered (SSR) with API Routes  
**Deployment:** Vercel (Frontend + API) + Neon (Database)

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  (React 19 + Next.js 15 App Router + TypeScript)           │
├─────────────────────────────────────────────────────────────┤
│  • Pages (login, dashboard, customers, shipments)          │
│  • Components (UI, Forms, Cards, Layout)                   │
│  • Custom Hooks (useAuth, useCustomers, useShipments)      │
│  • Frontend Validators (Zod schemas)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTE LAYER                         │
│              (Next.js API Routes - Serverless)              │
├─────────────────────────────────────────────────────────────┤
│  • /api/auth/* (login, register, logout, refresh)          │
│  • /api/customers/* (CRUD operations)                      │
│  • /api/shipments/* (CRUD operations + stats)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Function Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                         │
│              (Request Handling & Validation)                │
├─────────────────────────────────────────────────────────────┤
│  • AuthController (authentication logic)                   │
│  • CustomerController (customer operations)                │
│  • ShipmentController (shipment operations)                │
│  • BaseController (shared utilities)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Business Logic Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│                  (Business Logic & Rules)                   │
├─────────────────────────────────────────────────────────────┤
│  • UserService (user management, auth)                     │
│  • CustomerService (customer management)                   │
│  • ShipmentService (shipment operations)                   │
│  • BaseService (pagination, filtering)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Data Access Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                          │
│                (Database Access - Drizzle ORM)              │
├─────────────────────────────────────────────────────────────┤
│  • UserRepository (users table)                            │
│  • CustomerRepository (customers table)                    │
│  • ShipmentRepository (shipments table)                    │
│  • BaseRepository (generic CRUD operations)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Queries (Parameterized)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│              (PostgreSQL 15 - Neon Serverless)              │
├─────────────────────────────────────────────────────────────┤
│  • users table (authentication & profiles)                 │
│  • customers table (end customers)                         │
│  • shipments table (orders & tracking)                     │
│  • Indexes (15 total - single + composite)                 │
│  • Enums (shipment_type, shipment_mode)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with SSR, App Router |
| **React** | 19.0.0 | UI library for component-based architecture |
| **TypeScript** | 5.x | Type safety and enhanced DX |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Zod** | 3.24.1 | Schema validation (frontend + backend) |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.5.4 | Serverless API endpoints |
| **Drizzle ORM** | 0.37.0 | Type-safe database ORM |
| **PostgreSQL** | 15+ | Relational database (Neon Serverless) |
| **JWT** | 9.0.2 | Token-based authentication |
| **Bcrypt** | 5.1.1 | Password hashing |

### Development & Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Jest** | 29.7.0 | Testing framework |
| **Testing Library** | 14.3.1 | React component testing |
| **ESLint** | 9.x | Code linting |
| **TypeScript Compiler** | 5.x | Type checking |

---

## 🎨 Design Patterns

### 1. **Layered Architecture**
- **Separation of Concerns:** Each layer has a specific responsibility
- **Loose Coupling:** Layers interact through well-defined interfaces
- **Testability:** Each layer can be tested independently

### 2. **Repository Pattern**
```typescript
// Data access is abstracted through repositories
class CustomerRepository extends BaseRepository<Customer> {
  async findByUserId(userId: string): Promise<Customer[]> {
    return await this.find({ userId });
  }
}
```

### 3. **Service Layer Pattern**
```typescript
// Business logic is centralized in services
class CustomerService extends BaseService<Customer> {
  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    // Validation, business rules, then repository call
  }
}
```

### 4. **Controller Pattern**
```typescript
// Controllers handle HTTP requests/responses
class CustomerController extends BaseController {
  async create(req: NextRequest): Promise<NextResponse> {
    // Parse request, call service, return response
  }
}
```

### 5. **Active Record Pattern**
```typescript
// Domain models contain both data and behavior
class User {
  constructor(data: UserData) { /* ... */ }
  comparePassword(password: string): Promise<boolean> { /* ... */ }
  generateTokens(): { accessToken, refreshToken } { /* ... */ }
}
```

---

## 🔐 Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ 1. POST /api/auth/login                       │
     │   { email, password }                         │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                   2. Verify credentials
     │                                   3. Generate JWT tokens
     │                                   4. Set httpOnly cookies
     │                                               │
     │ 5. Return user data + tokens (in cookies)     │
     │<──────────────────────────────────────────────│
     │                                               │
     │ 6. Subsequent requests with cookies           │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                   7. Verify access token
     │                                   8. Process request
     │                                               │
     │ 9. Response                                   │
     │<──────────────────────────────────────────────│
     │                                               │
     │ 10. Token expired?                            │
     │     POST /api/auth/refresh                    │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                   11. Verify refresh token
     │                                   12. Generate new access token
     │                                               │
     │ 13. New access token (in cookie)              │
     │<──────────────────────────────────────────────│
```

**Token Details:**
- **Access Token:** 4 hours expiry, stored in httpOnly cookie
- **Refresh Token:** 15 days expiry, stored in httpOnly cookie
- **Security:** httpOnly, secure, sameSite flags enabled

---

## 🗄️ Database Design

### Entity Relationships
```
users (1) ──────< (N) customers
  │                      │
  │ (1)                  │ (1)
  │                      │
  └──────< (N) shipments <┘
```

### Key Constraints
- **users.email:** UNIQUE (prevent duplicate accounts)
- **ON DELETE CASCADE:** users → customers, users → shipments
- **ON DELETE RESTRICT:** customers → shipments (prevent data loss)

### Indexing Strategy
- **Single Column Indexes:** Fast lookups (email, phone, user_id)
- **Composite Indexes:** Complex queries (user_id + is_delivered)
- **Total Indexes:** 15 (10 single + 5 composite)

---

## 🔄 Request/Response Flow

### Example: Create Shipment

```
1. CLIENT
   └─> React Component calls useShipments.create()
         └─> Validates form data with Zod schema
               └─> Makes POST request to /api/shipments

2. API ROUTE
   └─> /api/shipments/route.ts receives request
         └─> Extracts JWT from cookies
               └─> Calls ShipmentController.create()

3. CONTROLLER
   └─> ShipmentController validates request body
         └─> Validates enums, required fields
               └─> Calls ShipmentService.create()

4. SERVICE
   └─> ShipmentService applies business rules
         └─> Checks user owns the customer
               └─> Calculates total cost
                     └─> Calls ShipmentRepository.create()

5. REPOSITORY
   └─> ShipmentRepository uses Drizzle ORM
         └─> Generates parameterized SQL query
               └─> Executes INSERT statement

6. DATABASE
   └─> PostgreSQL inserts record
         └─> Validates constraints
               └─> Updates indexes
                     └─> Returns inserted row

7. RESPONSE FLOW (Reverse)
   └─> Repository → Service → Controller → API Route → Client
         └─> Each layer transforms/enriches data
               └─> Final JSON response to client
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (3 files)
                    │  Workflows  │
                    └─────────────┘
                   ┌───────────────┐
                   │ Integration   │  (3 files)
                   │  API Tests    │
                   └───────────────┘
              ┌──────────────────────┐
              │   Unit Tests         │  (3 files)
              │ Validators & Utils   │
              └──────────────────────┘
```

### Test Coverage
- **Unit Tests:** Validators (auth, customer, shipment)
- **Integration Tests:** API endpoints (CRUD, pagination, filters)
- **E2E Tests:** Complete workflows (auth flow, customer flow, shipment flow)
- **Total Test Cases:** 156+

---

## 📂 Project Structure

```
shipsy/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes (serverless functions)
│   │   ├── auth/               # Authentication endpoints
│   │   ├── customers/          # Customer CRUD endpoints
│   │   └── shipments/          # Shipment CRUD endpoints
│   ├── (pages)/                # Frontend pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   └── shipments/
│   └── layout.tsx              # Root layout
│
├── components/                  # React components
│   ├── ui/                     # Base UI components
│   ├── layout/                 # Layout components
│   ├── customers/              # Customer components
│   └── shipments/              # Shipment components
│
├── lib/                         # Backend logic
│   ├── controllers/            # HTTP request handlers
│   ├── services/               # Business logic
│   ├── repositories/           # Data access layer
│   ├── validators/             # Zod validation schemas
│   ├── utils/                  # Utility functions
│   └── db/                     # Database connection & schema
│
├── models/                      # Domain models (Active Record)
│   ├── User.ts
│   ├── Customer.ts
│   └── Shipment.ts
│
├── types/                       # TypeScript type definitions
│   ├── api.types.ts
│   ├── customer.types.ts
│   └── shipment.types.ts
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   └── useShipments.ts
│
├── tests/                       # Test suites
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   └── helpers/                # Test utilities
│
└── docs/                        # Documentation
    ├── DbSchema.md
    ├── commit.md
    └── README.md
```

---

## 🚀 Deployment Architecture

### Vercel (Frontend + API)
```
┌─────────────────────────────────────────┐
│         Vercel Edge Network              │
│  (Global CDN + Serverless Functions)     │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────┐      ┌────────────┐     │
│  │   Static   │      │    API     │     │
│  │   Assets   │      │   Routes   │     │
│  │   (HTML,   │      │ (Serverless│     │
│  │   CSS, JS) │      │ Functions) │     │
│  └────────────┘      └────────────┘     │
│                                          │
└────────────┬─────────────────────────────┘
             │
             │ Database Connection
             ▼
┌─────────────────────────────────────────┐
│        Neon PostgreSQL Database          │
│           (Serverless Database)          │
├─────────────────────────────────────────┤
│  • Auto-scaling compute                 │
│  • Branch databases for dev/test        │
│  • Automated backups                    │
│  • Connection pooling                   │
└─────────────────────────────────────────┘
```

### Environment Configuration
- **Development:** Local `.env` file
- **Production:** Vercel environment variables
- **Database URL:** Neon connection string with pooling

---

## 🔒 Security Measures

### 1. Authentication & Authorization
- ✅ JWT tokens with short expiry (4 hours)
- ✅ Refresh tokens for session extension
- ✅ httpOnly cookies (prevent XSS)
- ✅ Password hashing with bcrypt (10 salt rounds)

### 2. Input Validation
- ✅ Zod schemas for all inputs
- ✅ Type validation (TypeScript)
- ✅ Enum validation (shipment type/mode)
- ✅ SQL injection prevention (parameterized queries)

### 3. Data Access Control
- ✅ User-scoped queries (users only see their data)
- ✅ JWT verification on protected routes
- ✅ Foreign key constraints (data integrity)

### 4. API Security
- ✅ CORS configuration
- ✅ Rate limiting (Vercel default)
- ✅ HTTPS only (enforced by Vercel)
- ✅ Environment variable protection

---

## 📊 Performance Optimization

### Database Level
- **Indexes:** 15 indexes for fast queries
- **Connection Pooling:** Neon automatic pooling
- **Query Optimization:** Composite indexes for common patterns

### Application Level
- **Server-Side Rendering:** Fast initial page loads
- **API Route Optimization:** Serverless function caching
- **Lazy Loading:** Component code splitting

### Frontend Level
- **React 19:** Concurrent rendering features
- **Next.js Image Optimization:** Automatic image optimization
- **Static Generation:** Pre-rendered pages where possible

---

## 🔄 Data Flow Patterns

### Read Operation (GET)
```
Client → API Route → Controller → Service → Repository → Database
                                                             ↓
Client ← JSON Response ← Transform ← Model ← Query Result ←┘
```

### Write Operation (POST/PUT)
```
Client → Validation → API Route → Controller → Validation
                                      ↓
Database ← Repository ← Service ← Business Logic
    ↓
Success Response → Client
```

### Error Handling
```
Error occurs at any layer
    ↓
Caught by layer's error handler
    ↓
Logged with context
    ↓
Transformed to API error response
    ↓
Returned to client with appropriate status code
```

---

## 🎯 Best Practices Implemented

### Code Organization
- ✅ **Single Responsibility Principle:** Each class has one purpose
- ✅ **DRY (Don't Repeat Yourself):** Base classes for common logic
- ✅ **SOLID Principles:** Followed throughout architecture

### Type Safety
- ✅ **End-to-End Types:** From database to frontend
- ✅ **Drizzle ORM Types:** Auto-inferred from schema
- ✅ **Zod Validation:** Runtime type checking

### Error Handling
- ✅ **Centralized Error Handling:** Consistent error responses
- ✅ **Logging:** Winston logger for debugging
- ✅ **User-Friendly Messages:** Clear error messages for users

### Testing
- ✅ **Comprehensive Coverage:** 156+ test cases
- ✅ **Test Pyramid:** Unit → Integration → E2E
- ✅ **Factory Pattern:** Reusable test data generation

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Serverless architecture (Vercel) scales automatically
- Database connection pooling handles concurrent requests
- Stateless API design enables easy scaling

### Vertical Scaling
- Neon database can scale compute independently
- Indexes optimize query performance
- Pagination prevents large data transfers

### Future Enhancements
- **Caching Layer:** Redis for frequently accessed data
- **Queue System:** Background job processing (email, notifications)
- **Microservices:** Split into smaller services if needed

---

## 🔗 Related Documentation

- **[Database Schema](./DbSchema.md)** - Complete database documentation
- **[API Documentation](./api.md)** - API endpoint reference
- **[Commit History](./commit.md)** - Development timeline
- **[Test Documentation](./TEST_SUITE_COMPLETE.md)** - Testing guide

---

**Last Updated:** October 6, 2025  
**Architecture Version:** 1.0  
**Maintained By:** Shipsy Development Team
