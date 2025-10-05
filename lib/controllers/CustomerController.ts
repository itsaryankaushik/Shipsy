import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { customerService } from '@/lib/services/CustomerService';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersSchema,
  searchCustomersSchema,
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

      // Get and validate query params
      const params = this.getQueryParams(request);
      const validation = this.validateBody(listCustomersSchema, params);

      if (!validation.valid) {
        return validation.response!;
      }

      // Get customers with pagination
      const result = await customerService.getCustomersByUser(
        auth.user!.userId,
        validation.data.page,
        validation.data.limit
      );

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(result.data, 'Customers retrieved successfully');
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

      // Get customer
      const result = await customerService.getCustomerById(
        params.id,
        auth.user!.userId
      );

      if (!result.success) {
        if (result.code === 'NOT_FOUND') {
          return this.notFound(result.message);
        }
        return this.error(result.message, result.code, 400);
      }

      return this.success(result.data, 'Customer retrieved successfully');
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

      // Create customer
      const result = await customerService.createCustomer(
        validation.data,
        auth.user!.userId
      );

      if (!result.success) {
        if (result.code === 'ALREADY_EXISTS') {
          return this.error(result.message, result.code, 409);
        }
        return this.error(result.message, result.code, 400);
      }

      const response = this.success(result.data, 'Customer created successfully');
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

      // Update customer
      const result = await customerService.updateCustomer(
        params.id,
        validation.data,
        auth.user!.userId
      );

      if (!result.success) {
        if (result.code === 'NOT_FOUND') {
          return this.notFound(result.message);
        }
        if (result.code === 'ALREADY_EXISTS') {
          return this.error(result.message, result.code, 409);
        }
        return this.error(result.message, result.code, 400);
      }

      return this.success(result.data, 'Customer updated successfully');
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

      // Delete customer
      const result = await customerService.deleteCustomer(
        params.id,
        auth.user!.userId
      );

      if (!result.success) {
        if (result.code === 'NOT_FOUND') {
          return this.notFound(result.message);
        }
        return this.error(result.message, result.code, 400);
      }

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
      const validation = this.validateBody(searchCustomersSchema, params);

      if (!validation.valid) {
        return validation.response!;
      }

      // Search customers
      const result = await customerService.searchCustomers(
        auth.user!.userId,
        validation.data.query,
        validation.data.page,
        validation.data.limit
      );

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(result.data, 'Search completed successfully');
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

      // Get customer count
      const result = await customerService.getCustomerCount(auth.user!.userId);

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(
        { totalCustomers: result.data },
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

      // Bulk delete
      const result = await customerService.bulkDeleteCustomers(
        validation.data.ids,
        auth.user!.userId
      );

      if (!result.success) {
        return this.error(result.message, result.code, 400);
      }

      return this.success(
        { deleted: result.data },
        `Successfully deleted ${result.data} customer(s)`
      );
    } catch (error) {
      return this.handleError(error, 'bulk delete customers');
    }
  }
}

// Export singleton instance
export const customerController = new CustomerController();
