import { BaseService } from './BaseService';
import { UserRepository, userRepository } from '@/lib/repositories/UserRepository';
import { User as UserSchema } from '@/lib/db/schema';
import { User } from '@/models/User';
import { hashPassword, verifyPassword, generateAuthTokens } from '@/lib/utils/auth';
import { AuthTokens, JWTPayload } from '@/types/api.types';

/**
 * UserService
 * Business logic for user operations
 */
export class UserService extends BaseService<UserSchema, UserRepository> {
  constructor(repository: UserRepository = userRepository) {
    super(repository);
  }

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Validate data
      const validation = await User.validateForCreation(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
      }

      // Check if email already exists
      const existingEmail = await this.repository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Check if phone already exists
      const existingPhone = await this.repository.findByPhone(data.phone);
      if (existingPhone) {
        throw new Error('Phone number already exists');
      }

      // Prepare and create user
      const userData = await User.prepareForCreation(data);
      const createdUser = await this.repository.create(userData);

      // Create user instance
      const user = User.fromDatabase(createdUser);

      // Generate tokens
      const tokens = generateAuthTokens({
        userId: user.id,
        email: user.email,
      });

      return { user, tokens };
    } catch (error) {
      throw this.handleError(error, 'register');
    }
  }

  /**
   * Login user
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Find user by email
      const userRecord = await this.repository.findByEmail(data.email);
      if (!userRecord) {
        throw new Error('Invalid email or password');
      }

      // Create user instance
      const user = User.fromDatabase(userRecord);

      // Verify password
      const isValid = await user.verifyPassword(data.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive()) {
        throw new Error('Account is inactive');
      }

      // Generate tokens
      const tokens = generateAuthTokens({
        userId: user.id,
        email: user.email,
      });

      return { user, tokens };
    } catch (error) {
      throw this.handleError(error, 'login');
    }
  }

  /**
   * Get user by ID and return User instance
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const userRecord = await this.repository.findById(id);
      if (!userRecord) {
        return null;
      }
      return User.fromDatabase(userRecord);
    } catch (error) {
      throw this.handleError(error, 'getUserById');
    }
  }

  /**
   * Get user by email and return User instance
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userRecord = await this.repository.findByEmail(email);
      if (!userRecord) {
        return null;
      }
      return User.fromDatabase(userRecord);
    } catch (error) {
      throw this.handleError(error, 'getUserByEmail');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
    }
  ): Promise<User> {
    try {
      // Check if user exists
      const existing = await this.repository.findById(userId);
      if (!existing) {
        throw new Error('User not found');
      }

      // Check if phone is being changed and if it's already taken
      if (data.phone && data.phone !== existing.phone) {
        const phoneExists = await this.repository.findByPhone(data.phone);
        if (phoneExists && phoneExists.id !== userId) {
          throw new Error('Phone number already in use');
        }
      }

      // Update user
      const sanitized = this.sanitizeData(data);
      const updated = await this.repository.update(userId, sanitized);

      if (!updated) {
        throw new Error('Failed to update user');
      }

      return User.fromDatabase(updated);
    } catch (error) {
      throw this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    data: {
      currentPassword: string;
      newPassword: string;
    }
  ): Promise<void> {
    try {
      // Get user
      const userRecord = await this.repository.findById(userId);
      if (!userRecord) {
        throw new Error('User not found');
      }

      const user = User.fromDatabase(userRecord);

      // Verify current password
      const isValid = await user.verifyPassword(data.currentPassword);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await hashPassword(data.newPassword);

      // Update password
      await this.repository.updatePassword(userId, newPasswordHash);
    } catch (error) {
      throw this.handleError(error, 'changePassword');
    }
  }

  /**
   * Verify user token and get user
   */
  async verifyAndGetUser(userId: string): Promise<User | null> {
    try {
      const userRecord = await this.repository.findById(userId);
      if (!userRecord) {
        return null;
      }

      const user = User.fromDatabase(userRecord);

      // Check if user is active
      if (!user.isActive()) {
        return null;
      }

      return user;
    } catch (error) {
      throw this.handleError(error, 'verifyAndGetUser');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      return await this.repository.emailExists(email);
    } catch (error) {
      throw this.handleError(error, 'emailExists');
    }
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    try {
      return await this.repository.phoneExists(phone);
    } catch (error) {
      throw this.handleError(error, 'phoneExists');
    }
  }
}

// Export singleton instance
export const userService = new UserService();
