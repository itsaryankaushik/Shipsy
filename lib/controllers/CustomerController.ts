import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { customerService } from '@/lib/services/CustomerService';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersSchema,
  searchCustomerSchema,
  bulkDeleteCustomersSchema,
} from '@/lib/validators/customer.validator';

/**
 * CustomerController
 * Handles customer-related HTTP requests
 */
class CustomerController extends BaseController {
  /**
   * Get all customers for authenticated user
   * GET /api/customers
   */
  async list(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'List Customers');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get query params manually (Zod schema has pipeline transforms)
      const params = this.getQueryParams(request);
      const page = params.page ? parseInt(params.page, 10) : 1;
      const limit = Math.min(params.limit ? parseInt(params.limit, 10) : 20, 100);

      // Get customers with pagination - service throws on error
      const result = await customerService.getCustomersByUser(auth.user!.userId, {
        page,
        limit,
        search: params.search,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
      });

      return this.success(result, 'Customers retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'list customers');
    }
  }

  /**
   * Get a single customer by ID
   * GET /api/customers/[id]
   */
  async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Customer');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get customer - service throws on error
      const customer = await customerService.getCustomerById(
        params.id,
        auth.user!.userId
      );

      if (!customer) {
        return this.notFound('Customer not found');
      }

      return this.success(customer, 'Customer retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'get customer');
    }
  }

  /**
   * Create a new customer
   * POST /api/customers
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Create Customer');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(createCustomerSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Create customer - service throws on error
      const customer = await customerService.createCustomer(auth.user!.userId, data);

      const response = this.success(customer, 'Customer created successfully');
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      return this.handleError(error, 'create customer');
    }
  }

  /**
   * Update a customer
   * PUT /api/customers/[id]
   */
  async update(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Update Customer');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(updateCustomerSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Update customer - service throws on error
      const customer = await customerService.updateCustomer(
        params.id,
        auth.user!.userId,
        data
      );

      return this.success(customer, 'Customer updated successfully');
    } catch (error) {
      return this.handleError(error, 'update customer');
    }
  }

  /**
   * Delete a customer
   * DELETE /api/customers/[id]
   */
  async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Delete Customer');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Delete customer - service throws on error
      await customerService.deleteCustomer(params.id, auth.user!.userId);

      return this.success(null, 'Customer deleted successfully');
    } catch (error) {
      return this.handleError(error, 'delete customer');
    }
  }

  /**
   * Search customers
   * GET /api/customers/search
   */
  async search(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Search Customers');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get and validate query params
      const params = this.getQueryParams(request);
      const validation = this.validateBody(searchCustomerSchema, params);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Search customers - service throws on error
      const customers = await customerService.searchCustomers(
        auth.user!.userId,
        data.query
      );

      return this.success(customers, 'Search completed successfully');
    } catch (error) {
      return this.handleError(error, 'search customers');
    }
  }

  /**
   * Get customer statistics
   * GET /api/customers/stats
   */
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Customer Stats');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get customer count - service throws on error
      const count = await customerService.getCustomerCount(auth.user!.userId);

      return this.success(
        { totalCustomers: count },
        'Statistics retrieved successfully'
      );
    } catch (error) {
      return this.handleError(error, 'get customer stats');
    }
  }

  /**
   * Bulk delete customers
   * DELETE /api/customers/bulk
   */
  async bulkDelete(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Bulk Delete Customers');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(bulkDeleteCustomersSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Bulk delete - service throws on error
      const deletedCount = await customerService.bulkDeleteCustomers(
        data.ids,
        auth.user!.userId
      );

      return this.success(
        { deleted: deletedCount },
        `Successfully deleted ${deletedCount} customer(s)`
      );
    } catch (error) {
      return this.handleError(error, 'bulk delete customers');
    }
  }
}

// Export singleton instance
export const customerController = new CustomerController();
