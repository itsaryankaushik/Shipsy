import { Customer as CustomerSchema } from '@/lib/db/schema';
import { formatPhoneNumber } from '@/lib/utils/formatters';

/**
 * Customer Domain Model
 * Represents an end customer of a shop owner
 */
export class Customer {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly phone: string;
  public readonly address: string;
  public readonly email: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: CustomerSchema) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.phone = data.phone;
    this.address = data.address;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a Customer instance from database record
   */
  static fromDatabase(data: CustomerSchema): Customer {
    return new Customer(data);
  }

  /**
   * Get customer data for JSON serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      phone: this.phone,
      address: this.address,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Get formatted phone number
   */
  getFormattedPhone(): string {
    return formatPhoneNumber(this.phone);
  }

  /**
   * Get customer display name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get customer initials
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
   * Check if customer has email
   */
  hasEmail(): boolean {
    return !!this.email && this.email.length > 0;
  }

  /**
   * Get short address (first 50 characters)
   */
  getShortAddress(): string {
    return this.address.length > 50
      ? this.address.substring(0, 50) + '...'
      : this.address;
  }

  /**
   * Check if customer belongs to a specific user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Get customer age (days since creation)
   */
  getCustomerAge(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if customer is new (created within last 30 days)
   */
  isNewCustomer(): boolean {
    return this.getCustomerAge() <= 30;
  }

  /**
   * Validate customer data before creation
   */
  static validateForCreation(data: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  }): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Phone validation
    if (!data.phone || data.phone.length < 10) {
      errors.push('Invalid phone number');
    }

    // Address validation
    if (!data.address || data.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters');
    }

    // Email validation (if provided)
    if (data.email && data.email.length > 0 && !data.email.includes('@')) {
      errors.push('Invalid email format');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Prepare data for database insertion
   */
  static prepareForCreation(
    userId: string,
    data: {
      name: string;
      phone: string;
      address: string;
      email?: string;
    }
  ): {
    userId: string;
    name: string;
    phone: string;
    address: string;
    email: string | undefined;
  } {
    return {
      userId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      email: data.email?.trim() || undefined,
    };
  }

  /**
   * Get contact information summary
   */
  getContactSummary(): {
    name: string;
    phone: string;
    email: string | null;
    formattedPhone: string;
  } {
    return {
      name: this.name,
      phone: this.phone,
      email: this.email,
      formattedPhone: this.getFormattedPhone(),
    };
  }

  /**
   * Check if customer data needs update
   */
  needsUpdate(newData: Partial<CustomerSchema>): boolean {
    return (
      (newData.name && newData.name !== this.name) ||
      (newData.phone && newData.phone !== this.phone) ||
      (newData.address && newData.address !== this.address) ||
      (newData.email !== undefined && newData.email !== this.email)
    );
  }
}
