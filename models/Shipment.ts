import { Shipment as ShipmentSchema, ShipmentType, ShipmentMode } from '@/lib/db/schema';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

/**
 * Shipment Domain Model
 * Represents a shipment/order with business logic
 */
export class Shipment {
  public readonly id: string;
  public readonly userId: string;
  public readonly customerId: string;
  public readonly type: ShipmentType;
  public readonly mode: ShipmentMode;
  public readonly startLocation: string;
  public readonly endLocation: string;
  public readonly cost: string;
  public readonly calculatedTotal: string;
  public readonly isDelivered: boolean;
  public readonly estimatedDeliveryDate: Date | null;
  public readonly deliveryDate: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: ShipmentSchema) {
    this.id = data.id;
    this.userId = data.userId;
    this.customerId = data.customerId;
    this.type = data.type;
    this.mode = data.mode;
    this.startLocation = data.startLocation;
    this.endLocation = data.endLocation;
    this.cost = data.cost;
    this.calculatedTotal = data.calculatedTotal;
    this.isDelivered = data.isDelivered;
    this.estimatedDeliveryDate = data.estimatedDeliveryDate;
    this.deliveryDate = data.deliveryDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a Shipment instance from database record
   */
  static fromDatabase(data: ShipmentSchema): Shipment {
    return new Shipment(data);
  }

  /**
   * Get shipment data for JSON serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      customerId: this.customerId,
      type: this.type,
      mode: this.mode,
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      cost: this.cost,
      calculatedTotal: this.calculatedTotal,
      isDelivered: this.isDelivered,
      estimatedDeliveryDate: this.estimatedDeliveryDate,
      deliveryDate: this.deliveryDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Additional computed fields
      formattedCost: this.getFormattedCost(),
      formattedTotal: this.getFormattedTotal(),
      status: this.getStatus(),
      daysInTransit: this.getDaysInTransit(),
    };
  }

  /**
   * Get formatted cost
   */
  getFormattedCost(): string {
    return formatCurrency(this.cost);
  }

  /**
   * Get formatted total
   */
  getFormattedTotal(): string {
    return formatCurrency(this.calculatedTotal);
  }

  /**
   * Get shipment status
   */
  getStatus(): 'pending' | 'delivered' | 'overdue' {
    if (this.isDelivered) {
      return 'delivered';
    }

    // Check if overdue (more than 30 days without delivery)
    const daysSinceCreation = this.getDaysSinceCreation();
    if (daysSinceCreation > 30) {
      return 'overdue';
    }

    return 'pending';
  }

  /**
   * Get status display text
   */
  getStatusDisplay(): string {
    const status = this.getStatus();
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Get days since creation
   */
  getDaysSinceCreation(): number {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days in transit
   */
  getDaysInTransit(): number | null {
    if (!this.isDelivered || !this.deliveryDate) {
      return null;
    }

    const diff = this.deliveryDate.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get formatted delivery date
   */
  getFormattedDeliveryDate(): string {
    return this.deliveryDate ? formatDate(this.deliveryDate, 'short') : 'Not delivered';
  }

  /**
   * Get route display (Start → End)
   */
  getRouteDisplay(): string {
    return `${this.startLocation} → ${this.endLocation}`;
  }

  /**
   * Check if shipment is international
   */
  isInternational(): boolean {
    return this.type === 'INTERNATIONAL';
  }

  /**
   * Check if shipment is domestic
   */
  isDomestic(): boolean {
    return this.type === 'LOCAL' || this.type === 'NATIONAL';
  }

  /**
   * Check if shipment is pending
   */
  isPending(): boolean {
    return !this.isDelivered;
  }

  /**
   * Check if shipment is overdue
   */
  isOverdue(): boolean {
    return this.getStatus() === 'overdue';
  }

  /**
   * Calculate tax amount (assuming 18% tax)
   */
  getTaxAmount(): number {
    const baseCost = parseFloat(this.cost);
    const total = parseFloat(this.calculatedTotal);
    return total - baseCost;
  }

  /**
   * Get formatted tax amount
   */
  getFormattedTaxAmount(): string {
    return formatCurrency(this.getTaxAmount().toFixed(2));
  }

  /**
   * Check if shipment belongs to a specific user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Check if shipment is for a specific customer
   */
  isForCustomer(customerId: string): boolean {
    return this.customerId === customerId;
  }

  /**
   * Validate shipment data before creation
   */
  static validateForCreation(data: {
    customerId: string;
    type: string;
    mode: string;
    startLocation: string;
    endLocation: string;
    cost: string;
    calculatedTotal: string;
  }): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Customer ID validation
    if (!data.customerId) {
      errors.push('Customer ID is required');
    }

    // Type validation
    if (!['LOCAL', 'NATIONAL', 'INTERNATIONAL'].includes(data.type)) {
      errors.push('Invalid shipment type');
    }

    // Mode validation
    if (!['LAND', 'AIR', 'WATER'].includes(data.mode)) {
      errors.push('Invalid shipment mode');
    }

    // Location validation
    if (!data.startLocation || data.startLocation.trim().length < 2) {
      errors.push('Start location is required');
    }
    if (!data.endLocation || data.endLocation.trim().length < 2) {
      errors.push('End location is required');
    }

    // Cost validation
    const cost = parseFloat(data.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push('Invalid cost value');
    }

    const total = parseFloat(data.calculatedTotal);
    if (isNaN(total) || total < cost) {
      errors.push('Calculated total must be greater than or equal to cost');
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
      customerId: string;
      type: ShipmentType;
      mode: ShipmentMode;
      startLocation: string;
      endLocation: string;
      cost: string;
      calculatedTotal: string;
      estimatedDeliveryDate?: Date | null;
    }
  ) {
    return {
      userId,
      customerId: data.customerId,
      type: data.type,
      mode: data.mode,
      startLocation: data.startLocation.trim(),
      endLocation: data.endLocation.trim(),
      cost: parseFloat(data.cost).toFixed(2),
      calculatedTotal: parseFloat(data.calculatedTotal).toFixed(2),
      estimatedDeliveryDate: data.estimatedDeliveryDate || null,
    };
  }

  /**
   * Get shipment summary for display
   */
  getSummary(): {
    id: string;
    route: string;
    type: string;
    mode: string;
    status: string;
    cost: string;
    total: string;
  } {
    return {
      id: this.id,
      route: this.getRouteDisplay(),
      type: this.type,
      mode: this.mode,
      status: this.getStatusDisplay(),
      cost: this.getFormattedCost(),
      total: this.getFormattedTotal(),
    };
  }

  /**
   * Calculate estimated delivery time (placeholder - can be enhanced)
   */
  getEstimatedDeliveryDays(): number {
    // Simple logic: LAND = 7 days, AIR = 3 days, WATER = 14 days
    // International adds 5 days
    let baseDays = {
      LAND: 7,
      AIR: 3,
      WATER: 14,
    }[this.mode];

    if (this.isInternational()) {
      baseDays += 5;
    }

    return baseDays;
  }
}
