import { BaseRepository } from './BaseRepository';
import { customers, Customer } from '@/lib/db/schema';
import { eq, and, like, desc, asc, SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { CustomerFilters } from '@/types/customer.types';

/**
 * CustomerRepository
 * Data access layer for Customer entity
 */
export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super(customers);
  }

  /**
   * Find customers by user ID
   */
  async findByUserId(userId: string, limit?: number): Promise<Customer[]> {
    try {
      let query = db
        .select()
        .from(customers)
        .where(eq(customers.userId, userId))
        .orderBy(desc(customers.createdAt));

      if (limit) {
        query = query.limit(limit) as any;
      }

      return await query;
    } catch (error) {
      throw this.handleError(error, 'findByUserId');
    }
  }

  /**
   * Find customer by phone
   */
  async findByPhone(userId: string, phone: string): Promise<Customer | undefined> {
    try {
      const result = await db
        .select()
        .from(customers)
        .where(and(eq(customers.userId, userId), eq(customers.phone, phone)))
        .limit(1);
      return result[0];
    } catch (error) {
      throw this.handleError(error, 'findByPhone');
    }
  }

  /**
   * Find customer by email
   */
  async findByEmail(userId: string, email: string): Promise<Customer | undefined> {
    try {
      const result = await db
        .select()
        .from(customers)
        .where(and(eq(customers.userId, userId), eq(customers.email, email)))
        .limit(1);
      return result[0];
    } catch (error) {
      throw this.handleError(error, 'findByEmail');
    }
  }

  /**
   * Search customers by name
   */
  async searchByName(userId: string, searchTerm: string): Promise<Customer[]> {
    try {
      return await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.userId, userId),
            like(customers.name, `%${searchTerm}%`)
          )
        )
        .orderBy(desc(customers.createdAt));
    } catch (error) {
      throw this.handleError(error, 'searchByName');
    }
  }

  /**
   * Advanced search with multiple fields
   */
  async search(userId: string, searchTerm: string): Promise<Customer[]> {
    try {
      return await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.userId, userId),
            or(
              like(customers.name, `%${searchTerm}%`),
              like(customers.phone, `%${searchTerm}%`),
              like(customers.email, `%${searchTerm}%`),
              like(customers.address, `%${searchTerm}%`)
            )
          )
        )
        .orderBy(desc(customers.createdAt));
    } catch (error) {
      throw this.handleError(error, 'search');
    }
  }

  /**
   * Find customers with filters and pagination
   */
  async findWithFilters(
    filters: CustomerFilters & {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ items: Customer[]; total: number }> {
    try {
      const {
        userId,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where conditions
      const conditions: SQL[] = [];
      if (userId) conditions.push(eq(customers.userId, userId));
      if (search) {
        conditions.push(
          or(
            like(customers.name, `%${search}%`),
            like(customers.phone, `%${search}%`),
            like(customers.email, `%${search}%`),
            like(customers.address, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const countQuery = db.select().from(customers);
      if (whereClause) {
        countQuery.where(whereClause as any);
      }
      const totalResult = await countQuery;
      const total = totalResult.length;

      // Get paginated results
      const offset = (page - 1) * limit;
      let query = db.select().from(customers);

      if (whereClause) {
        query = query.where(whereClause as any) as any;
      }

      // Apply sorting
      const sortColumn = (customers as any)[sortBy] || customers.createdAt;
      query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)) as any;

      // Apply pagination
      query = query.limit(limit).offset(offset) as any;

      const items = await query;

      return { items, total };
    } catch (error) {
      throw this.handleError(error, 'findWithFilters');
    }
  }

  /**
   * Count customers by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, userId));
      return result.length;
    } catch (error) {
      throw this.handleError(error, 'countByUserId');
    }
  }

  /**
   * Check if customer belongs to user
   */
  async belongsToUser(customerId: string, userId: string): Promise<boolean> {
    try {
      const customer = await this.findById(customerId);
      return customer?.userId === userId;
    } catch (error) {
      throw this.handleError(error, 'belongsToUser');
    }
  }
}

// Helper function for or conditions
function or(...conditions: (SQL | undefined)[]): SQL | undefined {
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);
  if (validConditions.length === 0) return undefined;
  if (validConditions.length === 1) return validConditions[0];
  return validConditions.reduce((acc, curr) => {
    return acc ? (acc as any).or(curr) : curr;
  });
}

// Export singleton instance
export const customerRepository = new CustomerRepository();
