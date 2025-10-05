import { BaseService } from './BaseService';
import { CustomerRepository, customerRepository } from '@/lib/repositories/CustomerRepository';
import { Customer as CustomerSchema } from '@/lib/db/schema';
import { Customer } from '@/models/Customer';
import { PaginationMeta } from '@/types/api.types';
import { createPaginationMeta } from '@/lib/utils/response';

/**
 * CustomerService
 * Business logic for customer operations
 */
export class CustomerService extends BaseService<CustomerSchema, CustomerRepository> {
  constructor(repository: CustomerRepository = customerRepository) {
    super(repository);
  }

  /**
   * Create a new customer
   */
  async createCustomer(
    userId: string,
    data: {
      name: string;
      phone: string;
      address: string;
      email?: string;
    }
  ): Promise<Customer> {
    try {
      // Validate data
      const validation = Customer.validateForCreation(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
      }

      // Check if phone already exists for this user
      const existingPhone = await this.repository.findByPhone(userId, data.phone);
      if (existingPhone) {
        throw new Error('Customer with this phone number already exists');
      }

      // Check if email already exists for this user (if provided)
      if (data.email) {
        const existingEmail = await this.repository.findByEmail(userId, data.email);
        if (existingEmail) {
          throw new Error('Customer with this email already exists');
        }
      }

      // Prepare and create customer
      const customerData = Customer.prepareForCreation(userId, data);
      const created = await this.repository.create(customerData);

      return Customer.fromDatabase(created);
    } catch (error) {
      throw this.handleError(error, 'createCustomer');
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string, userId: string): Promise<Customer | null> {
    try {
      const customerRecord = await this.repository.findById(id);
      if (!customerRecord) {
        return null;
      }

      const customer = Customer.fromDatabase(customerRecord);

      // Verify ownership
      if (!customer.belongsTo(userId)) {
        throw new Error('Unauthorized access to customer');
      }

      return customer;
    } catch (error) {
      throw this.handleError(error, 'getCustomerById');
    }
  }

  /**
   * Get all customers for a user with pagination
   */
  async getCustomersByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ customers: Customer[]; meta: PaginationMeta }> {
    try {
      const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const { items, total } = await this.repository.findWithFilters({
        userId,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      const customers = items.map((item) => Customer.fromDatabase(item));
      const meta = createPaginationMeta(page, limit, total);

      return { customers, meta };
    } catch (error) {
      throw this.handleError(error, 'getCustomersByUser');
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(userId: string, searchTerm: string): Promise<Customer[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      const results = await this.repository.search(userId, searchTerm.trim());
      return results.map((item) => Customer.fromDatabase(item));
    } catch (error) {
      throw this.handleError(error, 'searchCustomers');
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    id: string,
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      email?: string;
    }
  ): Promise<Customer> {
    try {
      // Check if customer exists and belongs to user
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Customer not found');
      }

      const customer = Customer.fromDatabase(existing);
      if (!customer.belongsTo(userId)) {
        throw new Error('Unauthorized access to customer');
      }

      // Check if phone is being changed and if it's already taken
      if (data.phone && data.phone !== existing.phone) {
        const phoneExists = await this.repository.findByPhone(userId, data.phone);
        if (phoneExists && phoneExists.id !== id) {
          throw new Error('Phone number already in use');
        }
      }

      // Check if email is being changed and if it's already taken
      if (data.email && data.email !== existing.email) {
        const emailExists = await this.repository.findByEmail(userId, data.email);
        if (emailExists && emailExists.id !== id) {
          throw new Error('Email already in use');
        }
      }

      // Update customer
      const sanitized = this.sanitizeData(data);
      const updated = await this.repository.update(id, sanitized);

      if (!updated) {
        throw new Error('Failed to update customer');
      }

      return Customer.fromDatabase(updated);
    } catch (error) {
      throw this.handleError(error, 'updateCustomer');
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string, userId: string): Promise<boolean> {
    try {
      // Check if customer exists and belongs to user
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Customer not found');
      }

      const customer = Customer.fromDatabase(existing);
      if (!customer.belongsTo(userId)) {
        throw new Error('Unauthorized access to customer');
      }

      // Delete customer
      return await this.repository.delete(id);
    } catch (error) {
      throw this.handleError(error, 'deleteCustomer');
    }
  }

  /**
   * Get customer count for user
   */
  async getCustomerCount(userId: string): Promise<number> {
    try {
      return await this.repository.countByUserId(userId);
    } catch (error) {
      throw this.handleError(error, 'getCustomerCount');
    }
  }

  /**
   * Check if customer belongs to user
   */
  async verifyOwnership(customerId: string, userId: string): Promise<boolean> {
    try {
      return await this.repository.belongsToUser(customerId, userId);
    } catch (error) {
      throw this.handleError(error, 'verifyOwnership');
    }
  }

  /**
   * Bulk delete customers
   */
  async bulkDeleteCustomers(ids: string[], userId: string): Promise<number> {
    try {
      // Verify all customers belong to user
      for (const id of ids) {
        const belongs = await this.repository.belongsToUser(id, userId);
        if (!belongs) {
          throw new Error(`Unauthorized access to customer ${id}`);
        }
      }

      return await this.repository.bulkDelete(ids);
    } catch (error) {
      throw this.handleError(error, 'bulkDeleteCustomers');
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService();
