import { BaseRepository } from '@/lib/repositories/BaseRepository';

/**
 * BaseService
 * Abstract base class for all services providing common business logic patterns
 * @template T - The entity type
 * @template R - The repository type
 */
export abstract class BaseService<T extends Record<string, any>, R extends BaseRepository<T>> {
  protected constructor(protected readonly repository: R) {}

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const entity = await this.repository.findById(id);
      return entity || null;
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Find all entities
   */
  async findAll(limit?: number): Promise<T[]> {
    try {
      return await this.repository.findAll(limit);
    } catch (error) {
      throw this.handleError(error, 'findAll');
    }
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Update an entity
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const entity = await this.repository.update(id, data);
      return entity || null;
    } catch (error) {
      throw this.handleError(error, 'update');
    }
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw this.handleError(error, 'delete');
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.repository.findById(id);
      return !!entity;
    } catch (error) {
      throw this.handleError(error, 'exists');
    }
  }

  /**
   * Bulk delete entities
   */
  async bulkDelete(ids: string[]): Promise<number> {
    try {
      return await this.repository.bulkDelete(ids);
    } catch (error) {
      throw this.handleError(error, 'bulkDelete');
    }
  }

  /**
   * Error handler
   */
  protected handleError(error: unknown, operation: string): Error {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Service error in ${operation}:`, message);
    return new Error(`Service error in ${operation}: ${message}`);
  }

  /**
   * Validate required fields
   */
  protected validateRequired(
    data: Record<string, any>,
    fields: string[]
  ): { valid: boolean; missing?: string[] } {
    const missing = fields.filter((field) => !data[field]);
    return {
      valid: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined,
    };
  }

  /**
   * Sanitize data for safe operations
   */
  protected sanitizeData<D extends Record<string, any>>(data: D): D {
    const sanitized = { ...data };
    
    // Remove undefined values
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }
}
