import { BaseRepository } from './BaseRepository';
import { users, User } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * UserRepository
 * Data access layer for User entity
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(users);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result[0];
    } catch (error) {
      throw this.handleError(error, 'findByEmail');
    }
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      return result[0];
    } catch (error) {
      throw this.handleError(error, 'findByPhone');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      throw this.handleError(error, 'emailExists');
    }
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    try {
      const user = await this.findByPhone(phone);
      return !!user;
    } catch (error) {
      throw this.handleError(error, 'phoneExists');
    }
  }

  /**
   * Update password hash
   */
  async updatePassword(userId: string, passwordHash: string): Promise<User | undefined> {
    try {
      return await this.update(userId, { passwordHash });
    } catch (error) {
      throw this.handleError(error, 'updatePassword');
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
