import { pgTable, text, timestamp, varchar, decimal, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const shipmentTypeEnum = pgEnum('shipment_type', [
  'LOCAL',
  'NATIONAL',
  'INTERNATIONAL',
]);

export const shipmentModeEnum = pgEnum('shipment_mode', [
  'LAND',
  'AIR',
  'WATER',
]);

// ============================================
// TABLES
// ============================================

/**
 * Users (Shop Owners)
 * Main authentication and shop owner management
 */
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

/**
 * Customers
 * End customers of the shop owners
 */
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

/**
 * Shipments (Orders)
 * Main shipment/order tracking system
 */
export const shipments = pgTable(
  'shipments',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
    
    // Shipment type and mode
    type: shipmentTypeEnum('type').notNull(),
    mode: shipmentModeEnum('mode').notNull(),
    
    // Location details
    startLocation: varchar('start_location', { length: 500 }).notNull(),
    endLocation: varchar('end_location', { length: 500 }).notNull(),
    
    // Financial details
    cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
    calculatedTotal: decimal('calculated_total', { precision: 10, scale: 2 }).notNull(),
    
    // Status and timeline
    isDelivered: boolean('is_delivered').notNull().default(false),
    deliveryDate: timestamp('delivery_date', { withTimezone: true }),
    
    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Single column indexes
    userIdIdx: index('shipments_user_id_idx').on(table.userId),
    customerIdIdx: index('shipments_customer_id_idx').on(table.customerId),
    typeIdx: index('shipments_type_idx').on(table.type),
    isDeliveredIdx: index('shipments_is_delivered_idx').on(table.isDelivered),
    createdAtIdx: index('shipments_created_at_idx').on(table.createdAt),
    
    // Composite indexes for complex queries
    userDeliveryStatusIdx: index('shipments_user_delivery_status_idx').on(table.userId, table.isDelivered),
    userTypeIdx: index('shipments_user_type_idx').on(table.userId, table.type),
    customerDeliveryIdx: index('shipments_customer_delivery_idx').on(table.customerId, table.isDelivered),
  })
);

// ============================================
// RELATIONS


export const usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  shipments: many(shipments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  shipments: many(shipments),
}));

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


// TYPE INFERENCE


// User types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Customer types
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

// Shipment types
export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;

// Enum types for type safety
export type ShipmentType = typeof shipmentTypeEnum.enumValues[number];
export type ShipmentMode = typeof shipmentModeEnum.enumValues[number];