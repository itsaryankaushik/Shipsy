# 🎴 Database Schema Quick Reference Card

> **Print-friendly cheat sheet for developers**

---

## 📊 Tables Overview

| # | Table | Icon | Purpose | Columns | PK | FKs |
|---|-------|------|---------|---------|----|----|
| 1 | **users** | 👤 | Shop owner accounts | 7 | id | - |
| 2 | **customers** | 👥 | End customer records | 8 | id | 1 (user_id) |
| 3 | **shipments** | 📦 | Order tracking system | 13 | id | 2 (user_id, customer_id) |

---

## 🗂️ Table Structures

### 👤 USERS

```
┌─────────────────────────────────────────────────────────┐
│ id              TEXT          PK  🔑                     │
│ email           VARCHAR(255)  UK  📧 (Login)            │
│ password_hash   TEXT          🔒 (Bcrypt)               │
│ name            VARCHAR(255)  👨                         │
│ phone           VARCHAR(20)   📱                         │
│ created_at      TIMESTAMPTZ   📅                         │
│ updated_at      TIMESTAMPTZ   🔄                         │
├─────────────────────────────────────────────────────────┤
│ INDEXES: email_idx, phone_idx                           │
│ RELATIONS: → customers (1:N), → shipments (1:N)         │
└─────────────────────────────────────────────────────────┘
```

### 👥 CUSTOMERS

```
┌─────────────────────────────────────────────────────────┐
│ id              TEXT          PK  🔑                     │
│ user_id         TEXT          FK  🔗 → users.id         │
│ name            VARCHAR(255)  👤                         │
│ phone           VARCHAR(20)   📱                         │
│ address         TEXT          🏠                         │
│ email           VARCHAR(255)  📧 (Optional)             │
│ created_at      TIMESTAMPTZ   📅                         │
│ updated_at      TIMESTAMPTZ   🔄                         │
├─────────────────────────────────────────────────────────┤
│ INDEXES: user_id_idx, phone_idx, email_idx              │
│ RELATIONS: ← users (N:1), → shipments (1:N)             │
│ CASCADE: ON DELETE users (CASCADE)                       │
└─────────────────────────────────────────────────────────┘
```

### 📦 SHIPMENTS

```
┌─────────────────────────────────────────────────────────┐
│ id                TEXT          PK  🔑                   │
│ user_id           TEXT          FK  🔗 → users.id       │
│ customer_id       TEXT          FK  🔗 → customers.id   │
│ type              shipment_type 🏷️  ENUM                │
│ mode              shipment_mode 🚚 ENUM                 │
│ start_location    VARCHAR(500)  📍                       │
│ end_location      VARCHAR(500)  🎯                       │
│ cost              NUMERIC(10,2) 💵                       │
│ calculated_total  NUMERIC(10,2) 💰                       │
│ is_delivered      BOOLEAN       ✅ (default: false)     │
│ delivery_date     TIMESTAMPTZ   📆 (Nullable)           │
│ created_at        TIMESTAMPTZ   📅                       │
│ updated_at        TIMESTAMPTZ   🔄                       │
├─────────────────────────────────────────────────────────┤
│ INDEXES: 8 total (5 single + 3 composite)               │
│  Single: user_id, customer_id, type, is_delivered,      │
│          created_at                                      │
│  Composite: (user_id, is_delivered),                    │
│             (user_id, type),                             │
│             (customer_id, is_delivered)                  │
├─────────────────────────────────────────────────────────┤
│ RELATIONS: ← users (N:1), ← customers (N:1)             │
│ CASCADE: ON DELETE users (CASCADE)                       │
│          ON DELETE customers (RESTRICT)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🏷️ Enum Values

### shipment_type
```
┌──────────────────┬────────────────────────────────────┐
│ LOCAL            │ 🏘️  Same city/metro area          │
│ NATIONAL         │ 🗺️  Cross-state/province          │
│ INTERNATIONAL    │ 🌍 Cross-border                   │
└──────────────────┴────────────────────────────────────┘
```

### shipment_mode
```
┌──────────────────┬────────────────────────────────────┐
│ LAND             │ 🚛 Road/Rail transport            │
│ AIR              │ ✈️  Air freight                    │
│ WATER            │ 🚢 Sea/Water transport            │
└──────────────────┴────────────────────────────────────┘
```

---

## 🔗 Relationships Cheat Sheet

```
CASCADE DELETE:
  users → customers  (Delete user = Delete all their customers)
  users → shipments  (Delete user = Delete all their shipments)

RESTRICT DELETE:
  customers → shipments  (Cannot delete customer with shipments)
```

---

## 📊 Index Quick Reference

### Single Column Indexes (10)

| Table | Index Name | Column | Use Case |
|-------|-----------|---------|----------|
| users | users_email_idx | email | Login, authentication |
| users | users_phone_idx | phone | Phone lookup |
| customers | customers_user_id_idx | user_id | List user's customers |
| customers | customers_phone_idx | phone | Search by phone |
| customers | customers_email_idx | email | Search by email |
| shipments | shipments_user_id_idx | user_id | List user's shipments |
| shipments | shipments_customer_id_idx | customer_id | List customer's shipments |
| shipments | shipments_type_idx | type | Filter by type |
| shipments | shipments_is_delivered_idx | is_delivered | Filter by status |
| shipments | shipments_created_at_idx | created_at | Sort by date |

### Composite Indexes (3)

| Index Name | Columns | Query Pattern |
|-----------|---------|---------------|
| shipments_user_delivery_status_idx | (user_id, is_delivered) | "My pending shipments" |
| shipments_user_type_idx | (user_id, type) | "My international shipments" |
| shipments_customer_delivery_idx | (customer_id, is_delivered) | "Customer's delivered items" |

---

## 🔑 Primary Keys & Constraints

### UUID Generation
```typescript
crypto.randomUUID()
// Example: "550e8400-e29b-41d4-a716-446655440000"
```

### Unique Constraints
- ✅ `users.email` - One email per account

### NOT NULL Constraints
All columns are NOT NULL except:
- ❌ `customers.email` (Optional)
- ❌ `shipments.delivery_date` (Set when delivered)

### Default Values
- `shipments.is_delivered` → `false`
- All `created_at` → `NOW()`
- All `updated_at` → `NOW()`

---

## 💾 Data Types Reference

### TEXT
- Unlimited length
- Used for: IDs, addresses, password hashes

### VARCHAR(n)
- Fixed max length
- Used for: emails (255), names (255), phones (20), locations (500)

### NUMERIC(10,2)
- 10 digits total, 2 decimal places
- Range: -99,999,999.99 to 99,999,999.99
- Used for: cost, calculated_total

### TIMESTAMPTZ
- Timestamp with timezone
- Stored in UTC, auto-converts to client timezone

### BOOLEAN
- true/false values
- Used for: is_delivered

---

## 🚀 Common Queries

### Get User's Pending Shipments
```sql
SELECT * FROM shipments 
WHERE user_id = ? AND is_delivered = false
ORDER BY created_at DESC;
```
**Index Used:** `shipments_user_delivery_status_idx` ⚡

### Get Customer's Delivery History
```sql
SELECT * FROM shipments 
WHERE customer_id = ? AND is_delivered = true
ORDER BY delivery_date DESC;
```
**Index Used:** `shipments_customer_delivery_idx` ⚡

### Get User's International Air Shipments
```sql
SELECT * FROM shipments 
WHERE user_id = ? 
  AND type = 'INTERNATIONAL' 
  AND mode = 'AIR';
```
**Index Used:** `shipments_user_type_idx` ⚡

### Search Customers by Email
```sql
SELECT * FROM customers 
WHERE email ILIKE '%@example.com%';
```
**Index Used:** `customers_email_idx` ⚡

---

## 🔐 Security Notes

### Password Storage
```
✅ DO: Bcrypt hash with 10 salt rounds
❌ DON'T: Store plain text passwords
```

### User Data Isolation
```
✅ DO: Filter by user_id in all queries
❌ DON'T: Expose other users' data
```

### SQL Injection Prevention
```
✅ DO: Use Drizzle ORM parameterized queries
❌ DON'T: Concatenate raw SQL with user input
```

---

## 📈 Statistics Queries

### User Stats
```sql
-- Customer count per user
SELECT u.name, COUNT(c.id) as customers
FROM users u
LEFT JOIN customers c ON u.id = c.user_id
GROUP BY u.id, u.name;
```

### Revenue by Type
```sql
-- Total revenue per shipment type
SELECT 
  type,
  SUM(calculated_total::numeric) as revenue
FROM shipments
WHERE is_delivered = true
GROUP BY type;
```

### Delivery Rate
```sql
-- Overall delivery percentage
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(SUM(CASE WHEN is_delivered THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as rate
FROM shipments;
```

---

## 🛠️ Drizzle ORM Helpers

### Type Inference
```typescript
// Inferred from schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type Customer = typeof customers.$inferSelect;
type Shipment = typeof shipments.$inferSelect;
```

### Enum Types
```typescript
type ShipmentType = typeof shipmentTypeEnum.enumValues[number];
// Result: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL'

type ShipmentMode = typeof shipmentModeEnum.enumValues[number];
// Result: 'LAND' | 'AIR' | 'WATER'
```

---

## 📝 Migration Commands

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Drizzle Studio
npm run db:studio
```

---

## 🎯 Field Validation Rules

### Email
- Format: RFC 5322 standard
- Max length: 255 characters
- Must be unique (users table)

### Phone
- Max length: 20 characters
- Include country code (e.g., +1234567890)

### Password
- Min length: 8 characters
- Must hash with bcrypt before storing

### Cost/Total
- Max: 99,999,999.99
- Min: 0.00
- 2 decimal places

### Locations
- Max length: 500 characters
- Required for shipments

---

<div align="center">

**Quick Reference Card v1.0**  
**Schema Version:** 0000_nervous_chimera  
**Last Updated:** October 6, 2025

---

**[📚 Full Documentation](./DbSchema.md)** | **[📊 Visual ERD](./database-erd.md)** | **[🏠 Docs Home](./README.md)**

</div>
