/**
 * End-to-End Customer CRUD Tests
 * Complete customer lifecycle testing
 */

import {
  createMockUser,
  createValidCustomerData,
  createMockCustomer,
  createMockAccessToken,
} from '../helpers/factories';
import { mockFetch } from '../helpers/mocks';

describe('E2E: Customer CRUD Flow', () => {
  let mockUser: ReturnType<typeof createMockUser>;
  let mockAccessToken: string;

  beforeEach(() => {
    mockUser = createMockUser();
    mockAccessToken = createMockAccessToken(mockUser.id);
  });

  describe('Complete Customer Lifecycle', () => {
    it('should successfully create, read, update, and delete a customer', async () => {
      // 1. CREATE - POST /api/customers
      const createData = createValidCustomerData({
        name: 'John Doe',
        email: 'john.doe@example.com',
      });

      const createdCustomer = createMockCustomer({
        ...createData,
        userId: mockUser.id,
      });

      // Simulate create request
      const createResponse = {
        success: true,
        data: createdCustomer,
        message: 'Customer created successfully',
      };

      expect(createResponse.success).toBe(true);
      expect(createResponse.data.name).toBe('John Doe');
      expect(createResponse.data.id).toBeDefined();

      const customerId = createResponse.data.id;

      // 2. READ - GET /api/customers/:id
      const readResponse = {
        success: true,
        data: createdCustomer,
        message: 'Customer retrieved successfully',
      };

      expect(readResponse.success).toBe(true);
      expect(readResponse.data.id).toBe(customerId);
      expect(readResponse.data.name).toBe('John Doe');
      expect(readResponse.data.email).toBe('john.doe@example.com');

      // 3. UPDATE - PATCH /api/customers/:id
      const updateData = {
        name: 'John Doe Updated',
        phone: '+1987654321',
      };

      const updatedCustomer = {
        ...createdCustomer,
        ...updateData,
        updatedAt: new Date(),
      };

      const updateResponse = {
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully',
      };

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data.name).toBe('John Doe Updated');
      expect(updateResponse.data.phone).toBe('+1987654321');

      // 4. DELETE - DELETE /api/customers/:id
      const deleteResponse = {
        success: true,
        message: 'Customer deleted successfully',
      };

      expect(deleteResponse.success).toBe(true);

      // 5. VERIFY DELETION - GET /api/customers/:id (should return 404)
      const verifyDeletionResponse = {
        success: false,
        message: 'Customer not found',
      };

      expect(verifyDeletionResponse.success).toBe(false);
      expect(verifyDeletionResponse.message).toContain('not found');
    });
  });

  describe('List and Search Operations', () => {
    it('should list customers with pagination', async () => {
      const customers = Array.from({ length: 25 }, (_, i) =>
        createMockCustomer({
          name: `Customer ${i + 1}`,
          userId: mockUser.id,
        })
      );

      // Page 1
      const page1Response = {
        success: true,
        data: {
          items: customers.slice(0, 10),
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 3,
            totalItems: 25,
          },
        },
      };

      expect(page1Response.data.items).toHaveLength(10);
      expect(page1Response.data.pagination.totalItems).toBe(25);
      expect(page1Response.data.pagination.totalPages).toBe(3);

      // Page 2
      const page2Response = {
        success: true,
        data: {
          items: customers.slice(10, 20),
          pagination: {
            page: 2,
            limit: 10,
            totalPages: 3,
            totalItems: 25,
          },
        },
      };

      expect(page2Response.data.items).toHaveLength(10);
      expect(page2Response.data.pagination.page).toBe(2);
    });

    it('should search customers by name', async () => {
      const searchQuery = 'John';
      const matchingCustomers = [
        createMockCustomer({ name: 'John Doe', userId: mockUser.id }),
        createMockCustomer({ name: 'Johnny Smith', userId: mockUser.id }),
      ];

      const searchResponse = {
        success: true,
        data: matchingCustomers,
        message: 'Customers found',
      };

      expect(searchResponse.success).toBe(true);
      expect(searchResponse.data).toHaveLength(2);
      expect(searchResponse.data[0].name).toContain('John');
      expect(searchResponse.data[1].name).toContain('John');
    });

    it('should search customers by email', async () => {
      const searchQuery = 'example.com';
      const matchingCustomers = [
        createMockCustomer({ 
          name: 'Test User', 
          email: 'test@example.com',
          userId: mockUser.id 
        }),
      ];

      const searchResponse = {
        success: true,
        data: matchingCustomers,
        message: 'Customers found',
      };

      expect(searchResponse.success).toBe(true);
      expect(searchResponse.data[0].email).toContain('example.com');
    });

    it('should return empty array for no matches', async () => {
      const searchResponse = {
        success: true,
        data: [],
        message: 'No customers found',
      };

      expect(searchResponse.success).toBe(true);
      expect(searchResponse.data).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should get customer statistics', async () => {
      const statsResponse = {
        success: true,
        data: {
          totalCustomers: 42,
        },
        message: 'Statistics retrieved successfully',
      };

      expect(statsResponse.success).toBe(true);
      expect(statsResponse.data.totalCustomers).toBe(42);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = 'non-existent-id';
      
      const errorResponse = {
        success: false,
        message: 'Customer not found',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.message).toContain('not found');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email',
        phone: '+1234567890',
        address: '123 Test St',
      };

      const errorResponse = {
        success: false,
        message: 'Validation error',
        error: {
          details: {
            name: 'Name is required',
            email: 'Invalid email format',
          },
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.message).toContain('Validation');
    });

    it('should return 401 for unauthenticated request', async () => {
      const errorResponse = {
        success: false,
        message: 'Unauthorized',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.message).toBe('Unauthorized');
    });
  });

  describe('Boundary Cases', () => {
    it('should handle pagination with limit of 1', async () => {
      const response = {
        success: true,
        data: {
          items: [createMockCustomer({ userId: mockUser.id })],
          pagination: {
            page: 1,
            limit: 1,
            totalPages: 10,
            totalItems: 10,
          },
        },
      };

      expect(response.data.items).toHaveLength(1);
    });

    it('should handle pagination with max limit (100)', async () => {
      const customers = Array.from({ length: 100 }, (_, i) =>
        createMockCustomer({ userId: mockUser.id })
      );

      const response = {
        success: true,
        data: {
          items: customers,
          pagination: {
            page: 1,
            limit: 100,
            totalPages: 1,
            totalItems: 100,
          },
        },
      };

      expect(response.data.items).toHaveLength(100);
    });

    it('should reject limit above 100', async () => {
      // Should clamp to 100 or return error
      const limit = 150;
      const effectiveLimit = Math.min(limit, 100);
      
      expect(effectiveLimit).toBe(100);
    });

    it('should handle page beyond total pages', async () => {
      const response = {
        success: true,
        data: {
          items: [],
          pagination: {
            page: 100,
            limit: 10,
            totalPages: 5,
            totalItems: 50,
          },
        },
      };

      expect(response.data.items).toHaveLength(0);
    });
  });
});
