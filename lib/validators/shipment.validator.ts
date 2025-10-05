import { z } from 'zod';

/**
 * Shipment Validators
 * Zod schemas for shipment-related operations
 */

// Shipment type and mode enums (matching database schema)
export const shipmentTypeEnum = z.enum(['LOCAL', 'NATIONAL', 'INTERNATIONAL']);
export const shipmentModeEnum = z.enum(['LAND', 'AIR', 'WATER']);

// Cost validation helper
const costString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal number (e.g., 100.50)')
  .refine((val) => parseFloat(val) >= 0, 'Must be 0 or greater');

// Base shipment schema
const baseShipmentSchema = {
  customerId: z.string().uuid('Invalid customer ID'),
  type: shipmentTypeEnum,
  mode: shipmentModeEnum,
  startLocation: z
    .string()
    .min(2, 'Start location must be at least 2 characters')
    .max(500, 'Start location too long')
    .trim(),
  endLocation: z
    .string()
    .min(2, 'End location must be at least 2 characters')
    .max(500, 'End location too long')
    .trim(),
  cost: costString,
  calculatedTotal: costString,
  deliveryDate: z
    .string()
    .datetime('Invalid date format (use ISO 8601)')
    .optional()
    .nullable()
    .or(z.literal('')),
};

// Create shipment validation schema
export const createShipmentSchema = z.object(baseShipmentSchema);

// Update shipment validation schema (all fields optional except customerId cannot be changed)
export const updateShipmentSchema = z.object({
  type: baseShipmentSchema.type.optional(),
  mode: baseShipmentSchema.mode.optional(),
  startLocation: baseShipmentSchema.startLocation.optional(),
  endLocation: baseShipmentSchema.endLocation.optional(),
  cost: costString.optional(),
  calculatedTotal: costString.optional(),
  deliveryDate: baseShipmentSchema.deliveryDate.optional(),
  isDelivered: z.boolean().optional(),
});

// List shipments with filters and pagination
export const listShipmentsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  type: shipmentTypeEnum.optional(),
  mode: shipmentModeEnum.optional(),
  isDelivered: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  customerId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(['createdAt', 'deliveryDate', 'cost', 'calculatedTotal', 'type'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().max(255).optional(), // Search in locations
});

// Shipment filter schema (for programmatic filtering)
export const shipmentFilterSchema = z.object({
  type: shipmentTypeEnum.optional(),
  mode: shipmentModeEnum.optional(),
  isDelivered: z.boolean().optional(),
  customerId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minCost: z.number().nonnegative().optional(),
  maxCost: z.number().nonnegative().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(['createdAt', 'deliveryDate', 'cost', 'calculatedTotal'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Mark shipment as delivered schema
export const markDeliveredSchema = z.object({
  deliveryDate: z
    .string()
    .datetime('Invalid date format (use ISO 8601)')
    .optional()
    .default(new Date().toISOString()),
});

// Shipment ID param schema (for route params)
export const shipmentIdSchema = z.object({
  id: z.string().uuid('Invalid shipment ID format'),
});

// Bulk operations schemas
export const bulkDeleteShipmentsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one shipment ID is required'),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one shipment ID is required'),
  isDelivered: z.boolean(),
  deliveryDate: z.string().datetime().optional(),
});

// Shipment statistics schema
export const shipmentStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['type', 'mode', 'customer', 'month']).optional(),
});

// Export inferred types
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type ListShipmentsInput = z.infer<typeof listShipmentsSchema>;
export type ShipmentFilterInput = z.infer<typeof shipmentFilterSchema>;
export type MarkDeliveredInput = z.infer<typeof markDeliveredSchema>;
export type ShipmentIdInput = z.infer<typeof shipmentIdSchema>;
export type BulkDeleteShipmentsInput = z.infer<typeof bulkDeleteShipmentsSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
export type ShipmentStatsInput = z.infer<typeof shipmentStatsSchema>;
export type ShipmentType = z.infer<typeof shipmentTypeEnum>;
export type ShipmentMode = z.infer<typeof shipmentModeEnum>;
