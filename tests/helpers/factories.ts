/**
 * Mock Data Factories
 * Helper functions to generate test data
 */

import { User } from '@/models/User';
import { Customer } from '@/models/Customer';
import { Shipment } from '@/models/Shipment';
import type { User as UserSchema } from '@/lib/db/schema';
import type { Customer as CustomerSchema } from '@/lib/db/schema';
import type { Shipment as ShipmentSchema } from '@/lib/db/schema';

// ============================================
// USER FACTORIES
// ============================================

export const createMockUser = (overrides?: Partial<UserSchema>): User => {
  const userData: UserSchema = {
    id: `user-${crypto.randomUUID()}`,
    email: 'test@shipsy.com',
    passwordHash: '$2a$10$hashedPasswordExample123456',
    name: 'Test User',
    phone: '+1234567890',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
  return new User(userData);
};

export const createMockUserWithPassword = (overrides?: Partial<UserSchema>) => {
  return createMockUser({
    passwordHash: '$2a$10$hashedPasswordExample123456',
    ...overrides,
  });
};

// ============================================
// CUSTOMER FACTORIES
// ============================================

export const createMockCustomer = (overrides?: Partial<CustomerSchema>): Customer => {
  const customerData: CustomerSchema = {
    id: `customer-${crypto.randomUUID()}`,
    userId: `user-${crypto.randomUUID()}`,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, New York, NY 10001',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
  return new Customer(customerData);
};

export const createMockCustomers = (count: number, userId?: string): Customer[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCustomer({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      userId: userId || `user-${crypto.randomUUID()}`,
    })
  );
};

// ============================================
// SHIPMENT FACTORIES
// ============================================

export const createMockShipment = (overrides?: Partial<ShipmentSchema>): Shipment => {
  const shipmentData: ShipmentSchema = {
    id: `shipment-${crypto.randomUUID()}`,
    userId: `user-${crypto.randomUUID()}`,
    customerId: `customer-${crypto.randomUUID()}`,
    type: 'LOCAL',
    mode: 'LAND',
    startLocation: 'New York, NY',
    endLocation: 'Boston, MA',
    cost: '1500.00',
    calculatedTotal: '1650.00',
    isDelivered: false,
    deliveryDate: null,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
  return new Shipment(shipmentData);
};

export const createMockShipments = (count: number, options?: {
  userId?: string;
  customerId?: string;
  isDelivered?: boolean;
}): Shipment[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockShipment({
      type: (['LOCAL', 'NATIONAL', 'INTERNATIONAL'][i % 3] as any),
      mode: (['AIR', 'WATER', 'LAND'][i % 3] as any),
      cost: ((i + 1) * 1000).toFixed(2),
      calculatedTotal: ((i + 1) * 1100).toFixed(2),
      isDelivered: options?.isDelivered ?? (i % 2 === 0),
      deliveryDate: options?.isDelivered ?? (i % 2 === 0) 
        ? new Date('2025-10-01T00:00:00.000Z') 
        : null,
      userId: options?.userId,
      customerId: options?.customerId,
    })
  );
};

// ============================================
// API RESPONSE FACTORIES
// ============================================

export const createSuccessResponse = <T>(data: T, message: string = 'Success') => ({
  success: true,
  data,
  message,
});

export const createErrorResponse = (message: string, details?: any) => ({
  success: false,
  message,
  error: details ? { details } : undefined,
});

export const createPaginatedResponse = <T>(items: T[], page: number = 1, limit: number = 10, total?: number) => ({
  success: true,
  data: {
    items,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil((total || items.length) / limit),
      totalItems: total || items.length,
    },
  },
  message: 'Retrieved successfully',
});

// ============================================
// JWT TOKEN FACTORIES
// ============================================

export const createMockAccessToken = (userId: string = 'test-user-id'): string => {
  // Mock JWT format (not a real JWT, just for testing)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    userId, 
    type: 'access',
    iat: Date.now(),
    exp: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
  })).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

export const createMockRefreshToken = (userId: string = 'test-user-id'): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    userId, 
    type: 'refresh',
    iat: Date.now(),
    exp: Date.now() + 15 * 24 * 60 * 60 * 1000 // 15 days
  })).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

// ============================================
// FORM DATA FACTORIES
// ============================================

export const createValidCustomerData = (overrides?: any) => ({
  name: 'Test Customer',
  email: 'customer@example.com',
  phone: '+1234567890',
  address: '123 Test St, Test City, TS 12345',
  ...overrides,
});

export const createInvalidCustomerData = (field: 'name' | 'email' | 'phone' | 'address') => {
  const base = createValidCustomerData();
  
  switch (field) {
    case 'name':
      return { ...base, name: '' }; // Empty name
    case 'email':
      return { ...base, email: 'invalid-email' }; // Invalid format
    case 'phone':
      return { ...base, phone: 'abc123' }; // Invalid format
    case 'address':
      return { ...base, address: '' }; // Empty address
  }
};

export const createValidShipmentData = (overrides?: any) => ({
  customerId: `customer-${crypto.randomUUID()}`,
  type: 'LOCAL' as const,
  mode: 'LAND' as const,
  startLocation: 'New York, NY',
  endLocation: 'Boston, MA',
  cost: '1500.00',
  calculatedTotal: '1650.00',
  deliveryDate: '2025-12-31',
  ...overrides,
});

export const createInvalidShipmentData = (field: string) => {
  const base = createValidShipmentData();
  
  switch (field) {
    case 'type':
      return { ...base, type: 'INVALID_TYPE' }; // Invalid enum
    case 'mode':
      return { ...base, mode: 'INVALID_MODE' }; // Invalid enum
    case 'cost':
      return { ...base, cost: 'not-a-number' }; // Invalid cost
    case 'startLocation':
      return { ...base, startLocation: '' }; // Empty location
    case 'deliveryDate':
      return { ...base, deliveryDate: 'invalid-date' }; // Invalid date
    default:
      return base;
  }
};

export const createValidAuthData = (overrides?: any) => ({
  email: 'test@shipsy.com',
  password: 'Test@123456',
  name: 'Test User',
  phone: '+1234567890',
  ...overrides,
});

// ============================================
// BOUNDARY TEST DATA
// ============================================

export const createBoundaryTestData = () => ({
  // Pagination boundaries
  pagination: {
    minPage: 1,
    maxPage: 1000,
    minLimit: 1,
    maxLimit: 100,
    invalidPage: 0,
    invalidLimit: 101,
  },
  
  // String length boundaries
  strings: {
    empty: '',
    minLength: 'a',
    maxLength: 'a'.repeat(500),
    tooLong: 'a'.repeat(501),
  },
  
  // Decimal boundaries
  decimals: {
    zero: '0.00',
    min: '0.01',
    max: '99999999.99',
    precision: '123.45',
    invalid: '123.456', // Too many decimals
  },
  
  // Date boundaries
  dates: {
    past: '2020-01-01',
    present: new Date().toISOString().split('T')[0],
    future: '2030-12-31',
    invalid: 'not-a-date',
  },
});

// ============================================
// HELPER UTILITIES
// ============================================

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateRandomEmail = () => `test${Math.random().toString(36).substring(7)}@example.com`;

export const generateRandomPhone = () => `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
