import { BaseRepository } from './BaseRepository';
import { shipments, Shipment, customers } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, asc, SQL, or, like } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ShipmentFilters } from '@/types/shipment.types';

/**
 * ShipmentRepository
 * Data access layer for Shipment entity
 */
export class ShipmentRepository extends BaseRepository<Shipment> {
  constructor() {
    super(shipments);
  }

  /**
   * Find shipments by user ID
   */
  async findByUserId(userId: string, limit?: number): Promise<Shipment[]> {
    try {
      let query = db
        .select()
        .from(shipments)
        .where(eq(shipments.userId, userId))
        .orderBy(desc(shipments.createdAt));

      if (limit) {
        query = query.limit(limit) as any;
      }

      return await query;
    } catch (error) {
      throw this.handleError(error, 'findByUserId');
    }
  }

  /**
   * Find shipments by customer ID
   */
  async findByCustomerId(customerId: string): Promise<Shipment[]> {
    try {
      return await db
        .select()
        .from(shipments)
        .where(eq(shipments.customerId, customerId))
        .orderBy(desc(shipments.createdAt));
    } catch (error) {
      throw this.handleError(error, 'findByCustomerId');
    }
  }

  /**
   * Find pending shipments for a user
   */
  async findPendingByUser(userId: string): Promise<Shipment[]> {
    try {
      return await db
        .select()
        .from(shipments)
        .where(
          and(
            eq(shipments.userId, userId),
            eq(shipments.isDelivered, false)
          )
        )
        .orderBy(desc(shipments.createdAt));
    } catch (error) {
      throw this.handleError(error, 'findPendingByUser');
    }
  }

  /**
   * Find delivered shipments for a user
   */
  async findDeliveredByUser(userId: string): Promise<Shipment[]> {
    try {
      return await db
        .select()
        .from(shipments)
        .where(
          and(
            eq(shipments.userId, userId),
            eq(shipments.isDelivered, true)
          )
        )
        .orderBy(desc(shipments.deliveryDate));
    } catch (error) {
      throw this.handleError(error, 'findDeliveredByUser');
    }
  }

  /**
   * Find shipments by type
   */
  async findByType(userId: string, type: string): Promise<Shipment[]> {
    try {
      return await db
        .select()
        .from(shipments)
        .where(
          and(
            eq(shipments.userId, userId),
            eq(shipments.type, type as any)
          )
        )
        .orderBy(desc(shipments.createdAt));
    } catch (error) {
      throw this.handleError(error, 'findByType');
    }
  }

  /**
   * Find shipments with filters and pagination
   */
  async findWithFilters(
    filters: ShipmentFilters & {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ items: Shipment[]; total: number }> {
    try {
      const {
        userId,
        customerId,
        type,
        mode,
        isDelivered,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      // Build where conditions
      const conditions: SQL[] = [];
      if (userId) conditions.push(eq(shipments.userId, userId));
      if (customerId) conditions.push(eq(shipments.customerId, customerId));
      if (type) conditions.push(eq(shipments.type, type as any));
      if (mode) conditions.push(eq(shipments.mode, mode as any));
      if (isDelivered !== undefined) conditions.push(eq(shipments.isDelivered, isDelivered));
      if (startDate) conditions.push(gte(shipments.createdAt, startDate));
      if (endDate) conditions.push(lte(shipments.createdAt, endDate));
      if (search) {
        conditions.push(
          or(
            like(shipments.startLocation, `%${search}%`),
            like(shipments.endLocation, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const countQuery = db.select().from(shipments);
      if (whereClause) {
        countQuery.where(whereClause as any);
      }
      const totalResult = await countQuery;
      const total = totalResult.length;

      // Get paginated results
      const offset = (page - 1) * limit;
      let query = db.select().from(shipments);

      if (whereClause) {
        query = query.where(whereClause as any) as any;
      }

      // Apply sorting
      const sortColumn = (shipments as any)[sortBy] || shipments.createdAt;
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
   * Mark shipment as delivered
   */
  async markAsDelivered(id: string, deliveryDate?: Date): Promise<Shipment | undefined> {
    try {
      return await this.update(id, {
        isDelivered: true,
        deliveryDate: deliveryDate || new Date(),
      });
    } catch (error) {
      throw this.handleError(error, 'markAsDelivered');
    }
  }

  /**
   * Get shipment with customer details
   */
  async findByIdWithCustomer(id: string): Promise<any> {
    try {
      const result = await db
        .select({
          shipment: shipments,
          customer: customers,
        })
        .from(shipments)
        .leftJoin(customers, eq(shipments.customerId, customers.id))
        .where(eq(shipments.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      return {
        ...result[0].shipment,
        customer: result[0].customer,
      };
    } catch (error) {
      throw this.handleError(error, 'findByIdWithCustomer');
    }
  }

  /**
   * Count shipments by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(shipments)
        .where(eq(shipments.userId, userId));
      return result.length;
    } catch (error) {
      throw this.handleError(error, 'countByUserId');
    }
  }

  /**
   * Count pending shipments
   */
  async countPendingByUserId(userId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(shipments)
        .where(
          and(
            eq(shipments.userId, userId),
            eq(shipments.isDelivered, false)
          )
        );
      return result.length;
    } catch (error) {
      throw this.handleError(error, 'countPendingByUserId');
    }
  }

  /**
   * Check if shipment belongs to user
   */
  async belongsToUser(shipmentId: string, userId: string): Promise<boolean> {
    try {
      const shipment = await this.findById(shipmentId);
      return shipment?.userId === userId;
    } catch (error) {
      throw this.handleError(error, 'belongsToUser');
    }
  }

  /**
   * Calculate total revenue for user
   */
  async calculateTotalRevenue(userId: string): Promise<number> {
    try {
      const shipmentsList = await this.findByUserId(userId);
      return shipmentsList.reduce((sum, s) => sum + parseFloat(s.calculatedTotal), 0);
    } catch (error) {
      throw this.handleError(error, 'calculateTotalRevenue');
    }
  }
}

// Export singleton instance
export const shipmentRepository = new ShipmentRepository();
