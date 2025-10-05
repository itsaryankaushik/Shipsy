import { pgTable, text, timestamp, varchar, decimal, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


// ENUMS


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


// TABLES


/**
 * Users (Shop Owners)
 * Main authentication and shop owner management
 */
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Customers
 * End customers of the shop owners
 */
export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Shipments (Orders)
 * Main shipment/order tracking system
 */
export const shipments = pgTable('shipments', {
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
});


// INDEXES (Modern Approach)


// Users indexes
export const usersEmailIdx = index('users_email_idx').on(users.email);
export const usersPhoneIdx = index('users_phone_idx').on(users.phone);

// Customers indexes
export const customersUserIdIdx = index('customers_user_id_idx').on(customers.userId);
export const customersPhoneIdx = index('customers_phone_idx').on(customers.phone);
export const customersEmailIdx = index('customers_email_idx').on(customers.email);

// Shipments indexes - Single column
export const shipmentsUserIdIdx = index('shipments_user_id_idx').on(shipments.userId);
export const shipmentsCustomerIdIdx = index('shipments_customer_id_idx').on(shipments.customerId);
export const shipmentsTypeIdx = index('shipments_type_idx').on(shipments.type);
export const shipmentsIsDeliveredIdx = index('shipments_is_delivered_idx').on(shipments.isDelivered);
export const shipmentsCreatedAtIdx = index('shipments_created_at_idx').on(shipments.createdAt);

// Shipments indexes - Composite (for complex queries)
export const shipmentsUserDeliveryStatusIdx = index('shipments_user_delivery_status_idx').on(
  shipments.userId,
  shipments.isDelivered
);
export const shipmentsUserTypeIdx = index('shipments_user_type_idx').on(
  shipments.userId,
  shipments.type
);
export const shipmentsCustomerDeliveryIdx = index('shipments_customer_delivery_idx').on(
  shipments.customerId,
  shipments.isDelivered
);


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