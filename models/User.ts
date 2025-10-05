import { User as UserSchema } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/utils/auth';

/**
 * User Domain Model
 * Represents a shop owner with business logic
 */
export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  private passwordHash: string;

  constructor(data: UserSchema) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a User instance from database record
   */
  static fromDatabase(data: UserSchema): User {
    return new User(data);
  }

  /**
   * Get public user data (without sensitive information)
   */
  toPublic(): {
    id: string;
    email: string;
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Get user data for JSON serialization
   */
  toJSON() {
    return this.toPublic();
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(password: string): Promise<boolean> {
    return await verifyPassword(password, this.passwordHash);
  }

  /**
   * Get password hash (for updating)
   */
  getPasswordHash(): string {
    return this.passwordHash;
  }

  /**
   * Check if user is active (can be extended with more logic)
   */
  isActive(): boolean {
    // Add business logic here (e.g., check subscription, account status)
    return true;
  }

  /**
   * Get user display name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get user initials
   */
  getInitials(): string {
    return this.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Check if email is verified (placeholder for future implementation)
   */
  isEmailVerified(): boolean {
    // TODO: Implement email verification logic
    return true;
  }

  /**
   * Get account age in days
   */
  getAccountAge(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate user data before creation
   */
  static async validateForCreation(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    // Email validation
    if (!data.email || !data.email.includes('@')) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Phone validation
    if (!data.phone || data.phone.length < 10) {
      errors.push('Invalid phone number');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Prepare data for database insertion
   */
  static async prepareForCreation(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{
    email: string;
    passwordHash: string;
    name: string;
    phone: string;
  }> {
    const passwordHash = await hashPassword(data.password);

    return {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name.trim(),
      phone: data.phone.trim(),
    };
  }
}
