import { BaseService } from './BaseService';
import { ShipmentRepository, shipmentRepository } from '@/lib/repositories/ShipmentRepository';
import { Shipment as ShipmentSchema, ShipmentType, ShipmentMode } from '@/lib/db/schema';
import { Shipment } from '@/models/Shipment';
import { PaginationMeta } from '@/types/api.types';
import { ShipmentStats } from '@/types/shipment.types';
import { createPaginationMeta } from '@/lib/utils/response';
import { customerRepository } from '@/lib/repositories/CustomerRepository';

/**
 * ShipmentService
 * Business logic for shipment operations
 */
export class ShipmentService extends BaseService<ShipmentSchema, ShipmentRepository> {
  constructor(repository: ShipmentRepository = shipmentRepository) {
    super(repository);
  }

  /**
   * Create a new shipment
   */
  async createShipment(
    userId: string,
    data: {
      customerId: string;
      type: ShipmentType;
      mode: ShipmentMode;
      startLocation: string;
      endLocation: string;
      cost: string;
      calculatedTotal: string;
      deliveryDate?: Date | null;
    }
  ): Promise<Shipment> {
    try {
      // Validate data
      const validation = Shipment.validateForCreation(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
      }

      // Verify customer belongs to user
      const customerBelongs = await customerRepository.belongsToUser(data.customerId, userId);
      if (!customerBelongs) {
        throw new Error('Customer not found or unauthorized');
      }

      // Prepare and create shipment
      const shipmentData = Shipment.prepareForCreation(userId, data);
      const created = await this.repository.create(shipmentData);

      return Shipment.fromDatabase(created);
    } catch (error) {
      throw this.handleError(error, 'createShipment');
    }
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(id: string, userId: string): Promise<Shipment | null> {
    try {
      const shipmentRecord = await this.repository.findById(id);
      if (!shipmentRecord) {
        return null;
      }

      const shipment = Shipment.fromDatabase(shipmentRecord);

      // Verify ownership
      if (!shipment.belongsTo(userId)) {
        throw new Error('Unauthorized access to shipment');
      }

      return shipment;
    } catch (error) {
      throw this.handleError(error, 'getShipmentById');
    }
  }

  /**
   * Get shipment with customer details
   */
  async getShipmentWithCustomer(id: string, userId: string): Promise<any> {
    try {
      const shipmentWithCustomer = await this.repository.findByIdWithCustomer(id);
      
      if (!shipmentWithCustomer) {
        return null;
      }

      // Verify ownership
      if (shipmentWithCustomer.userId !== userId) {
        throw new Error('Unauthorized access to shipment');
      }

      return shipmentWithCustomer;
    } catch (error) {
      throw this.handleError(error, 'getShipmentWithCustomer');
    }
  }

  /**
   * Get all shipments for a user with filters and pagination
   */
  async getShipmentsByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: ShipmentType;
      mode?: ShipmentMode;
      isDelivered?: boolean;
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ shipments: Shipment[]; meta: PaginationMeta }> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        mode,
        isDelivered,
        customerId,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const { items, total } = await this.repository.findWithFilters({
        userId,
        type,
        mode,
        isDelivered,
        customerId,
        startDate,
        endDate,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      const shipments = items.map((item) => Shipment.fromDatabase(item));
      const meta = createPaginationMeta(page, limit, total);

      return { shipments, meta };
    } catch (error) {
      throw this.handleError(error, 'getShipmentsByUser');
    }
  }

  /**
   * Get shipments by customer
   */
  async getShipmentsByCustomer(customerId: string, userId: string): Promise<Shipment[]> {
    try {
      // Verify customer belongs to user
      const customerBelongs = await customerRepository.belongsToUser(customerId, userId);
      if (!customerBelongs) {
        throw new Error('Customer not found or unauthorized');
      }

      const results = await this.repository.findByCustomerId(customerId);
      return results.map((item) => Shipment.fromDatabase(item));
    } catch (error) {
      throw this.handleError(error, 'getShipmentsByCustomer');
    }
  }

  /**
   * Get pending shipments
   */
  async getPendingShipments(userId: string): Promise<Shipment[]> {
    try {
      const results = await this.repository.findPendingByUser(userId);
      return results.map((item) => Shipment.fromDatabase(item));
    } catch (error) {
      throw this.handleError(error, 'getPendingShipments');
    }
  }

  /**
   * Get delivered shipments
   */
  async getDeliveredShipments(userId: string): Promise<Shipment[]> {
    try {
      const results = await this.repository.findDeliveredByUser(userId);
      return results.map((item) => Shipment.fromDatabase(item));
    } catch (error) {
      throw this.handleError(error, 'getDeliveredShipments');
    }
  }

  /**
   * Update shipment
   */
  async updateShipment(
    id: string,
    userId: string,
    data: {
      type?: ShipmentType;
      mode?: ShipmentMode;
      startLocation?: string;
      endLocation?: string;
      cost?: string;
      calculatedTotal?: string;
      deliveryDate?: Date | null;
      isDelivered?: boolean;
    }
  ): Promise<Shipment> {
    try {
      // Check if shipment exists and belongs to user
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Shipment not found');
      }

      const shipment = Shipment.fromDatabase(existing);
      if (!shipment.belongsTo(userId)) {
        throw new Error('Unauthorized access to shipment');
      }

      // Update shipment
      const sanitized = this.sanitizeData(data);
      const updated = await this.repository.update(id, sanitized);

      if (!updated) {
        throw new Error('Failed to update shipment');
      }

      return Shipment.fromDatabase(updated);
    } catch (error) {
      throw this.handleError(error, 'updateShipment');
    }
  }

  /**
   * Mark shipment as delivered
   */
  async markAsDelivered(id: string, userId: string, deliveryDate?: Date): Promise<Shipment> {
    try {
      // Check if shipment exists and belongs to user
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Shipment not found');
      }

      const shipment = Shipment.fromDatabase(existing);
      if (!shipment.belongsTo(userId)) {
        throw new Error('Unauthorized access to shipment');
      }

      // Check if already delivered
      if (shipment.isDelivered) {
        throw new Error('Shipment is already delivered');
      }

      // Mark as delivered
      const updated = await this.repository.markAsDelivered(id, deliveryDate);
      if (!updated) {
        throw new Error('Failed to mark shipment as delivered');
      }

      return Shipment.fromDatabase(updated);
    } catch (error) {
      throw this.handleError(error, 'markAsDelivered');
    }
  }

  /**
   * Delete shipment
   */
  async deleteShipment(id: string, userId: string): Promise<boolean> {
    try {
      // Check if shipment exists and belongs to user
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Shipment not found');
      }

      const shipment = Shipment.fromDatabase(existing);
      if (!shipment.belongsTo(userId)) {
        throw new Error('Unauthorized access to shipment');
      }

      // Delete shipment
      return await this.repository.delete(id);
    } catch (error) {
      throw this.handleError(error, 'deleteShipment');
    }
  }

  /**
   * Get shipment statistics
   */
  async getShipmentStats(userId: string): Promise<ShipmentStats> {
    try {
      const allShipments = await this.repository.findByUserId(userId);
      const totalShipments = allShipments.length;
      const pendingShipments = await this.repository.countPendingByUserId(userId);
      const deliveredShipments = totalShipments - pendingShipments;

      // Calculate total revenue
      const totalRevenue = await this.repository.calculateTotalRevenue(userId);

      // Calculate average cost
      const averageCost =
        totalShipments > 0
          ? allShipments.reduce((sum, s) => sum + parseFloat(s.cost), 0) / totalShipments
          : 0;

      // Group by type
      const byType = allShipments.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<ShipmentType, number>);

      // Group by mode
      const byMode = allShipments.reduce((acc, s) => {
        acc[s.mode] = (acc[s.mode] || 0) + 1;
        return acc;
      }, {} as Record<ShipmentMode, number>);

      // Get recent shipments (last 5)
      const recentShipments = allShipments.slice(0, 5);

      return {
        totalShipments,
        pendingShipments,
        deliveredShipments,
        totalRevenue,
        averageCost,
        byType,
        byMode,
        recentShipments,
      };
    } catch (error) {
      throw this.handleError(error, 'getShipmentStats');
    }
  }

  /**
   * Check if shipment belongs to user
   */
  async verifyOwnership(shipmentId: string, userId: string): Promise<boolean> {
    try {
      return await this.repository.belongsToUser(shipmentId, userId);
    } catch (error) {
      throw this.handleError(error, 'verifyOwnership');
    }
  }

  /**
   * Bulk delete shipments
   */
  async bulkDeleteShipments(ids: string[], userId: string): Promise<number> {
    try {
      // Verify all shipments belong to user
      for (const id of ids) {
        const belongs = await this.repository.belongsToUser(id, userId);
        if (!belongs) {
          throw new Error(`Unauthorized access to shipment ${id}`);
        }
      }

      return await this.repository.bulkDelete(ids);
    } catch (error) {
      throw this.handleError(error, 'bulkDeleteShipments');
    }
  }
}

// Export singleton instance
export const shipmentService = new ShipmentService();
