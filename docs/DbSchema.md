# 🗄️ Shipsy Database Schema Documentation

![Shipsy Database Schema](./dbschema.png)

> **📊 Visual ERD Diagrams:** For interactive Mermaid diagrams, see [`database-erd.md`](./database-erd.md)  
> **🎴 Quick Reference:** For a print-friendly cheat sheet, see [`QuickReference.md`](./QuickReference.md)

## 📋 Quick Reference

| Metric | Value |
|--------|-------|
| **Database** | PostgreSQL 15+ (Neon Serverless) |
| **ORM** | Drizzle ORM |
| **Total Tables** | 3 (users, customers, shipments) |
| **Total Columns** | 28 across all tables |
| **Enum Types** | 2 (shipment_type, shipment_mode) |
| **Indexes** | 15 total (10 single + 5 composite) |
| **Foreign Keys** | 3 relationships |
| **Schema Version** | `0000_nervous_chimera` |
| **Last Updated** | October 6, 2025 |

## 📋 Overview

This document describes the complete database schema for the Shipsy application, including table structures, relationships, indexes, and constraints.

### Table Summary

| Table | Purpose | Columns | Indexes | Relations |
|-------|---------|---------|---------|-----------|
| 👤 **users** | Shop owner accounts | 7 | 2 | Parent to customers & shipments |
| 👥 **customers** | End customer records | 8 | 3 | Child of users, parent to shipments |
| 📦 **shipments** | Order tracking | 13 | 8 (3 composite) | Child of users & customers |

**Database Technology:** PostgreSQL (Neon Serverless)  
**ORM:** Drizzle ORM  
**Schema Version:** 0000_nervous_chimera  
**Last Updated:** October 6, 2025

---

## 📊 Entity Relationship Diagram (ERD)

### Visual Database Schema

```mermaid
erDiagram
    USERS ||--o{ CUSTOMERS : "owns (CASCADE)"
    USERS ||--o{ SHIPMENTS : "creates (CASCADE)"
    CUSTOMERS ||--o{ SHIPMENTS : "receives (RESTRICT)"
    
    USERS {
        text id PK "UUID"
        varchar(255) email UK "Unique email"
        text password_hash "Bcrypt hash"
        varchar(255) name
        varchar(20) phone
        timestamptz created_at
        timestamptz updated_at
    }
    
    CUSTOMERS {
        text id PK "UUID"
        text user_id FK "→ users.id"
        varchar(255) name
        varchar(20) phone
        text address
        varchar(255) email "Optional"
        timestamptz created_at
        timestamptz updated_at
    }
    
    SHIPMENTS {
        text id PK "UUID"
        text user_id FK "→ users.id"
        text customer_id FK "→ customers.id"
        shipment_type type "ENUM"
        shipment_mode mode "ENUM"
        varchar(500) start_location
        varchar(500) end_location
        numeric(10,2) cost
        numeric(10,2) calculated_total
        boolean is_delivered "default: false"
        timestamptz delivery_date "Nullable"
        timestamptz created_at
        timestamptz updated_at
    }
```

### Relationship Summary

| Parent | Child | Type | Delete Rule | Description |
|--------|-------|------|-------------|-------------|
| **USERS** | **CUSTOMERS** | One-to-Many | `CASCADE` | Deleting a user removes all their customers |
| **USERS** | **SHIPMENTS** | One-to-Many | `CASCADE` | Deleting a user removes all their shipments |
| **CUSTOMERS** | **SHIPMENTS** | One-to-Many | `RESTRICT` | Cannot delete customer with existing shipments |

### Enum Types

| Enum | Values | Usage |
|------|--------|-------|
| **shipment_type** | `LOCAL`, `NATIONAL`, `INTERNATIONAL` | Geographical scope |
| **shipment_mode** | `LAND`, `AIR`, `WATER` | Transportation method |

---

## 📑 Table Definitions

---

### 1. 👤 **users** Table

**Purpose:** Stores shop owner/business user accounts with authentication credentials.

**Total Columns:** 7 | **Indexes:** 2 | **Relations:** 2 (customers, shipments)

---

#### 📋 Schema Definition

```sql
CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "phone" varchar(20) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
```

#### 📊 Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| 🔑 **id** | `TEXT` | ❌ | `crypto.randomUUID()` | PRIMARY KEY | Unique user identifier (UUID) |
| 📧 **email** | `VARCHAR(255)` | ❌ | - | UNIQUE | User's email (login identifier) |
| 🔒 **password_hash** | `TEXT` | ❌ | - | - | Bcrypt hashed password (salt rounds: 10) |
| 👨 **name** | `VARCHAR(255)` | ❌ | - | - | User's full name |
| 📱 **phone** | `VARCHAR(20)` | ❌ | - | - | Contact phone (with country code) |
| 📅 **created_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Account creation timestamp |
| 🔄 **updated_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Last profile update timestamp |

#### Indexes

```sql
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");
```

**Purpose:**
- `users_email_idx` - Fast email lookup for login/authentication
- `users_phone_idx` - Quick phone number search

#### Drizzle Schema

```typescript
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    phoneIdx: index('users_phone_idx').on(table.phone),
  })
);
```

#### Example Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@shipsy.com",
  "password_hash": "$2a$10$rN8L.5RZj8j8j8j8j8j8j8j8",
  "name": "John Doe",
  "phone": "+1234567890",
  "created_at": "2025-10-01T08:30:00Z",
  "updated_at": "2025-10-01T08:30:00Z"
}
```

---

### 2. 👥 **customers** Table

**Purpose:** Stores end customers who receive shipments from shop owners.

**Total Columns:** 8 | **Indexes:** 3 | **Relations:** 2 (users, shipments)

---

#### 📋 Schema Definition

```sql
CREATE TABLE "customers" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "phone" varchar(20) NOT NULL,
  "address" text NOT NULL,
  "email" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
  ON DELETE cascade ON UPDATE no action;
```

#### 📊 Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| 🔑 **id** | `TEXT` | ❌ | `crypto.randomUUID()` | PRIMARY KEY | Unique customer identifier (UUID) |
| 🔗 **user_id** | `TEXT` | ❌ | - | FOREIGN KEY → `users.id` | Shop owner (CASCADE delete) |
| 👤 **name** | `VARCHAR(255)` | ❌ | - | - | Customer's full name |
| 📱 **phone** | `VARCHAR(20)` | ❌ | - | - | Customer's contact phone |
| 🏠 **address** | `TEXT` | ❌ | - | - | Full delivery address |
| 📧 **email** | `VARCHAR(255)` | ✅ | `NULL` | - | Customer's email (optional) |
| 📅 **created_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Record creation timestamp |
| 🔄 **updated_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Last update timestamp |

#### Foreign Keys

- **user_id → users.id**
  - **ON DELETE:** CASCADE (delete customers when user is deleted)
  - **ON UPDATE:** NO ACTION

#### Indexes

```sql
CREATE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");
```

**Purpose:**
- `customers_user_id_idx` - List all customers for a specific user
- `customers_phone_idx` - Search customers by phone
- `customers_email_idx` - Search customers by email

#### Drizzle Schema

```typescript
export const customers = pgTable(
  'customers',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    address: text('address').notNull(),
    email: varchar('email', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('customers_user_id_idx').on(table.userId),
    phoneIdx: index('customers_phone_idx').on(table.phone),
    emailIdx: index('customers_email_idx').on(table.email),
  })
);
```

#### Example Data

```json
{
  "id": "c91e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1987654321",
  "address": "123 Main St, New York, NY 10001",
  "created_at": "2025-10-02T10:15:00Z",
  "updated_at": "2025-10-02T10:15:00Z"
}
```

---

### 3. 📦 **shipments** Table

**Purpose:** Main shipment/order tracking system with type, mode, and delivery status.

**Total Columns:** 13 | **Indexes:** 8 (3 composite) | **Relations:** 2 (users, customers)

---

#### 📋 Schema Definition

```sql
CREATE TABLE "shipments" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "customer_id" text NOT NULL,
  "type" "shipment_type" NOT NULL,
  "mode" "shipment_mode" NOT NULL,
  "start_location" varchar(500) NOT NULL,
  "end_location" varchar(500) NOT NULL,
  "cost" numeric(10, 2) NOT NULL,
  "calculated_total" numeric(10, 2) NOT NULL,
  "is_delivered" boolean DEFAULT false NOT NULL,
  "delivery_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customer_id_customers_id_fk" 
  FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") 
  ON DELETE restrict ON UPDATE no action;
```

#### 📊 Column Specifications

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| 🔑 **id** | `TEXT` | ❌ | `crypto.randomUUID()` | PRIMARY KEY | Unique shipment identifier (UUID) |
| 🔗 **user_id** | `TEXT` | ❌ | - | FOREIGN KEY → `users.id` | Shop owner (CASCADE delete) |
| 🔗 **customer_id** | `TEXT` | ❌ | - | FOREIGN KEY → `customers.id` | Recipient (RESTRICT delete) |
| 🏷️ **type** | `shipment_type` | ❌ | - | ENUM | LOCAL / NATIONAL / INTERNATIONAL |
| 🚚 **mode** | `shipment_mode` | ❌ | - | ENUM | LAND / AIR / WATER |
| 📍 **start_location** | `VARCHAR(500)` | ❌ | - | - | Origin address/city |
| 🎯 **end_location** | `VARCHAR(500)` | ❌ | - | - | Destination address/city |
| 💵 **cost** | `NUMERIC(10,2)` | ❌ | - | - | Base shipment cost (USD) |
| 💰 **calculated_total** | `NUMERIC(10,2)` | ❌ | - | - | Total cost with taxes/fees |
| ✅ **is_delivered** | `BOOLEAN` | ❌ | `false` | - | Delivery status flag |
| 📆 **delivery_date** | `TIMESTAMPTZ` | ✅ | `NULL` | - | Actual/estimated delivery date |
| 📅 **created_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Shipment creation timestamp |
| 🔄 **updated_at** | `TIMESTAMPTZ` | ❌ | `NOW()` | - | Last update timestamp |

#### Foreign Keys

- **user_id → users.id**
  - **ON DELETE:** CASCADE (delete shipments when user is deleted)
  - **ON UPDATE:** NO ACTION

- **customer_id → customers.id**
  - **ON DELETE:** RESTRICT (prevent customer deletion if shipments exist)
  - **ON UPDATE:** NO ACTION

#### Indexes

```sql
-- Single column indexes
CREATE INDEX "shipments_user_id_idx" ON "shipments" USING btree ("user_id");
CREATE INDEX "shipments_customer_id_idx" ON "shipments" USING btree ("customer_id");
CREATE INDEX "shipments_type_idx" ON "shipments" USING btree ("type");
CREATE INDEX "shipments_is_delivered_idx" ON "shipments" USING btree ("is_delivered");
CREATE INDEX "shipments_created_at_idx" ON "shipments" USING btree ("created_at");

-- Composite indexes for complex queries
CREATE INDEX "shipments_user_delivery_status_idx" ON "shipments" USING btree ("user_id","is_delivered");
CREATE INDEX "shipments_user_type_idx" ON "shipments" USING btree ("user_id","type");
CREATE INDEX "shipments_customer_delivery_idx" ON "shipments" USING btree ("customer_id","is_delivered");
```

**Purpose:**
- `shipments_user_id_idx` - List all shipments for a user
- `shipments_customer_id_idx` - List all shipments for a customer
- `shipments_type_idx` - Filter by shipment type
- `shipments_is_delivered_idx` - Filter by delivery status
- `shipments_created_at_idx` - Sort by creation date
- `shipments_user_delivery_status_idx` - User's pending/delivered shipments
- `shipments_user_type_idx` - User's shipments by type
- `shipments_customer_delivery_idx` - Customer's delivery status

#### Drizzle Schema

```typescript
export const shipments = pgTable(
  'shipments',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
    type: shipmentTypeEnum('type').notNull(),
    mode: shipmentModeEnum('mode').notNull(),
    startLocation: varchar('start_location', { length: 500 }).notNull(),
    endLocation: varchar('end_location', { length: 500 }).notNull(),
    cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
    calculatedTotal: decimal('calculated_total', { precision: 10, scale: 2 }).notNull(),
    isDelivered: boolean('is_delivered').notNull().default(false),
    deliveryDate: timestamp('delivery_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('shipments_user_id_idx').on(table.userId),
    customerIdIdx: index('shipments_customer_id_idx').on(table.customerId),
    typeIdx: index('shipments_type_idx').on(table.type),
    isDeliveredIdx: index('shipments_is_delivered_idx').on(table.isDelivered),
    createdAtIdx: index('shipments_created_at_idx').on(table.createdAt),
    userDeliveryStatusIdx: index('shipments_user_delivery_status_idx').on(table.userId, table.isDelivered),
    userTypeIdx: index('shipments_user_type_idx').on(table.userId, table.type),
    customerDeliveryIdx: index('shipments_customer_delivery_idx').on(table.customerId, table.isDelivered),
  })
);
```

#### Example Data

```json
{
  "id": "s11e8400-e29b-41d4-a716-446655440002",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_id": "c91e8400-e29b-41d4-a716-446655440001",
  "type": "NATIONAL",
  "mode": "AIR",
  "start_location": "New York, NY",
  "end_location": "Los Angeles, CA",
  "cost": "2500.00",
  "calculated_total": "2875.00",
  "is_delivered": false,
  "delivery_date": "2025-10-15T00:00:00Z",
  "created_at": "2025-10-03T14:20:00Z",
  "updated_at": "2025-10-03T14:20:00Z"
}
```

---

## 🏷️ Enum Types

### shipment_type

Defines the geographical scope of the shipment.

```sql
CREATE TYPE "public"."shipment_type" AS ENUM('LOCAL', 'NATIONAL', 'INTERNATIONAL');
```

**Values:**
- **LOCAL** - Within the same city or metropolitan area
- **NATIONAL** - Within the same country (cross-state/province)
- **INTERNATIONAL** - Cross-border shipments

**Drizzle Schema:**
```typescript
export const shipmentTypeEnum = pgEnum('shipment_type', [
  'LOCAL',
  'NATIONAL',
  'INTERNATIONAL',
]);
```

---

### shipment_mode

Defines the transportation method used for the shipment.

```sql
CREATE TYPE "public"."shipment_mode" AS ENUM('LAND', 'AIR', 'WATER');
```

**Values:**
- **LAND** - Road or rail transport
- **AIR** - Air freight
- **WATER** - Sea or water transport

**Drizzle Schema:**
```typescript
export const shipmentModeEnum = pgEnum('shipment_mode', [
  'LAND',
  'AIR',
  'WATER',
]);
```

---

## 🔗 Relationships & Relations

### Drizzle Relations Configuration

```typescript
// Users → Customers & Shipments (One-to-Many)
export const usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  shipments: many(shipments),
}));

// Customers → User (Many-to-One) & Shipments (One-to-Many)
export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  shipments: many(shipments),
}));

// Shipments → User & Customer (Many-to-One)
export const shipmentsRelations = relations(shipments, ({ one }) => ({
  user: one(users, {
    fields: [shipments.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [shipments.customerId],
    references: [customers.id],
  }),
}));
```

### Relationship Rules

1. **Users → Customers:** CASCADE DELETE
   - When a user is deleted, all their customers are automatically deleted

2. **Users → Shipments:** CASCADE DELETE
   - When a user is deleted, all their shipments are automatically deleted

3. **Customers → Shipments:** RESTRICT DELETE
   - Cannot delete a customer if they have shipments
   - Must delete all shipments first, or change customer_id

---

## 📊 Index Strategy

### Purpose of Indexes

#### Single Column Indexes
Used for simple queries and lookups:
- **Email/Phone lookups** - Authentication and search
- **User filtering** - Get all records for a user
- **Status filtering** - Filter by delivery status
- **Date sorting** - Order by creation date

#### Composite Indexes
Optimized for complex queries with multiple conditions:
- **User + Delivery Status** - "Show me my pending shipments"
- **User + Type** - "Show me my international shipments"
- **Customer + Delivery** - "Show customer's delivered shipments"

### Query Performance Examples

```sql
-- FAST: Uses shipments_user_delivery_status_idx
SELECT * FROM shipments 
WHERE user_id = '...' AND is_delivered = false;

-- FAST: Uses shipments_user_type_idx
SELECT * FROM shipments 
WHERE user_id = '...' AND type = 'INTERNATIONAL';

-- FAST: Uses customers_email_idx
SELECT * FROM customers 
WHERE email LIKE '%@example.com%';

-- FAST: Uses shipments_created_at_idx
SELECT * FROM shipments 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔐 Data Integrity & Constraints

### Primary Keys
- All tables use `TEXT` UUID as primary key
- Generated using `crypto.randomUUID()`
- Example: `550e8400-e29b-41d4-a716-446655440000`

### Unique Constraints
- **users.email** - Prevents duplicate email registrations

### Foreign Key Constraints
- **customers.user_id → users.id** (CASCADE)
- **shipments.user_id → users.id** (CASCADE)
- **shipments.customer_id → customers.id** (RESTRICT)

### NOT NULL Constraints
- All columns except:
  - `customers.email` (optional)
  - `shipments.delivery_date` (set when delivered)

### Default Values
- `shipments.is_delivered` defaults to `false`
- All `created_at` and `updated_at` default to `NOW()`

---

## 📏 Data Type Specifications

### TEXT vs VARCHAR
- **TEXT:** Used for IDs and long content (no length limit)
- **VARCHAR(n):** Used for constrained fields with max length

### NUMERIC (10, 2)
- **Precision:** 10 digits total
- **Scale:** 2 decimal places
- **Range:** -99,999,999.99 to 99,999,999.99
- **Example:** `1234.56`, `0.99`, `99999999.99`

### TIMESTAMP WITH TIME ZONE
- Stores timestamp with timezone information
- Always in UTC internally
- Auto-converts based on client timezone

### BOOLEAN
- True/False values
- Used for flags like `is_delivered`

---

## 🗂️ TypeScript Type Inference

Drizzle ORM automatically infers TypeScript types from the schema:

```typescript
// Inferred types for database operations
export type User = typeof users.$inferSelect;      // SELECT query result
export type NewUser = typeof users.$inferInsert;   // INSERT data type

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;

// Enum types for type safety
export type ShipmentType = typeof shipmentTypeEnum.enumValues[number];
// Result: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL'

export type ShipmentMode = typeof shipmentModeEnum.enumValues[number];
// Result: 'LAND' | 'AIR' | 'WATER'
```

---

## 🔄 Migration Strategy

### Current Migration
- **File:** `drizzle/0000_nervous_chimera.sql`
- **Status:** Base schema (initial migration)

### Running Migrations

```bash
# Generate new migration
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### Migration Commands (package.json)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx lib/db/migrate.ts",
    "db:seed": "tsx lib/db/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 📈 Database Statistics Queries

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

### Shipment Statistics
```sql
-- Shipments by type
SELECT type, COUNT(*) as count
FROM shipments
GROUP BY type;

-- Shipments by mode
SELECT mode, COUNT(*) as count
FROM shipments
GROUP BY mode;

-- Delivery rate
SELECT 
  COUNT(*) as total_shipments,
  SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as delivery_rate
FROM shipments;

-- Total revenue
SELECT 
  SUM(calculated_total::numeric) as total_revenue
FROM shipments
WHERE is_delivered = true;
```

---

## 🔍 Common Query Patterns

### User Queries
```sql
-- Get user with customers and shipments count
SELECT 
  u.*,
  COUNT(DISTINCT c.id) as customer_count,
  COUNT(DISTINCT s.id) as shipment_count
FROM users u
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN shipments s ON u.id = s.user_id
WHERE u.id = 'user-uuid'
GROUP BY u.id;
```

### Customer Queries
```sql
-- Get customer with shipment history
SELECT 
  c.*,
  COUNT(s.id) as total_shipments,
  SUM(CASE WHEN s.is_delivered THEN 1 ELSE 0 END) as delivered_count
FROM customers c
LEFT JOIN shipments s ON c.id = s.customer_id
WHERE c.id = 'customer-uuid'
GROUP BY c.id;
```

### Shipment Queries
```sql
-- Get pending shipments with customer details
SELECT 
  s.*,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone
FROM shipments s
JOIN customers c ON s.customer_id = c.id
WHERE s.user_id = 'user-uuid' 
  AND s.is_delivered = false
ORDER BY s.created_at DESC;

-- Get shipments by type and mode
SELECT *
FROM shipments
WHERE user_id = 'user-uuid'
  AND type = 'INTERNATIONAL'
  AND mode = 'AIR'
  AND is_delivered = false;
```

---

## 🛡️ Security Considerations

### Password Storage
- **Never store plain text passwords**
- Use bcrypt with salt rounds = 10
- Store only the hash in `password_hash` column

### Data Access Control
- Users can only access their own data
- Enforced at application level (not database level)
- See `lib/utils/auth.ts` for implementation

### SQL Injection Prevention
- Drizzle ORM uses parameterized queries
- All user inputs are automatically escaped
- Never concatenate raw SQL with user input

---

## 📦 Backup & Recovery

### Neon Serverless Features
- **Auto Backups:** Daily automated backups
- **Point-in-Time Recovery:** Restore to any point in time
- **Branching:** Create database branches for testing

### Manual Backup
```bash
# Export schema
pg_dump -h <host> -U <user> -d <database> -s > schema.sql

# Export data
pg_dump -h <host> -U <user> -d <database> -a > data.sql

# Full backup
pg_dump -h <host> -U <user> -d <database> > full_backup.sql
```

---

## 📚 Additional Resources

- **Drizzle ORM Documentation:** https://orm.drizzle.team/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Neon Documentation:** https://neon.tech/docs/introduction

---

**Last Updated:** October 6, 2025  
**Schema Version:** 0000_nervous_chimera  
**Maintained By:** Shipsy Development Team
