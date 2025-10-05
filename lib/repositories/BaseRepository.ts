import { db } from '@/lib/db';
import { SQL, eq, and, or, inArray } from 'drizzle-orm';

/**
 * BaseRepository
 * Abstract base class for all repositories providing common CRUD operations
 * @template T - The entity type
 */
export abstract class BaseRepository<T extends Record<string, any>> {
  protected constructor(protected readonly table: any) {}

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | undefined> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);
      return result[0] as T | undefined;
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Find all records
   */
  async findAll(limit?: number): Promise<T[]> {
    try {
      let query = db.select().from(this.table);
      if (limit) {
        query = query.limit(limit) as any;
      }
      return (await query) as T[];
    } catch (error) {
      throw this.handleError(error, 'findAll');
    }
  }

  /**
   * Find records matching a condition
   */
  async findWhere(condition: SQL): Promise<T[]> {
    try {
      const result = await db.select().from(this.table).where(condition);
      return result as T[];
    } catch (error) {
      throw this.handleError(error, 'findWhere');
    }
  }

  /**
   * Find one record matching a condition
   */
  async findOneWhere(condition: SQL): Promise<T | undefined> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(condition)
        .limit(1);
      return result[0] as T | undefined;
    } catch (error) {
      throw this.handleError(error, 'findOneWhere');
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const result: any = await db.insert(this.table).values(data).returning();
      return result[0] as T;
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    try {
      const result = await db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(this.table.id, id))
        .returning();
      return result[0] as T | undefined;
    } catch (error) {
      throw this.handleError(error, 'update');
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result: any = await db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      throw this.handleError(error, 'delete');
    }
  }

  /**
   * Count records matching a condition
   */
  async count(condition?: SQL): Promise<number> {
    try {
      let query = db.select().from(this.table);
      if (condition) {
        query = query.where(condition) as any;
      }
      const result = await query;
      return result.length;
    } catch (error) {
      throw this.handleError(error, 'count');
    }
  }

  /**
   * Check if a record exists
   */
  async exists(condition: SQL): Promise<boolean> {
    try {
      const count = await this.count(condition);
      return count > 0;
    } catch (error) {
      throw this.handleError(error, 'exists');
    }
  }

  /**
   * Bulk insert records
   */
  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    try {
      const result = await db.insert(this.table).values(data).returning();
      return result as T[];
    } catch (error) {
      throw this.handleError(error, 'bulkCreate');
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await db
        .delete(this.table)
        .where(inArray(this.table.id, ids))
        .returning();
      return (result as any[]).length;
    } catch (error) {
      throw this.handleError(error, 'bulkDelete');
    }
  }

  /**
   * Error handler
   */
  protected handleError(error: unknown, operation: string): Error {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Error(`Repository error in ${operation}: ${message}`);
  }
}
