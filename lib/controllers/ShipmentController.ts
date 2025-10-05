import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { shipmentService } from '@/lib/services/ShipmentService';
import {
  createShipmentSchema,
  updateShipmentSchema,
  listShipmentsSchema,
  bulkDeleteShipmentsSchema,
} from '@/lib/validators/shipment.validator';

/**
 * ShipmentController
 * Handles shipment-related HTTP requests
 */
class ShipmentController extends BaseController {
  /**
   * Get all shipments for authenticated user with filters
   * GET /api/shipments
   */
  async list(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'List Shipments');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get query params manually (Zod schema has pipeline transforms that need raw strings)
      const params = this.getQueryParams(request);
      
      // Build options object with proper type conversions
      const options = {
        page: params.page ? parseInt(params.page, 10) : 1,
        limit: Math.min(params.limit ? parseInt(params.limit, 10) : 20, 100),
        type: params.type as any,
        mode: params.mode as any,
        isDelivered: params.isDelivered === 'true' ? true : params.isDelivered === 'false' ? false : undefined,
        customerId: params.customerId,
        startDate: params.startDate ? new Date(params.startDate) : undefined,
        endDate: params.endDate ? new Date(params.endDate) : undefined,
        search: params.search,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
      };

      // Get shipments with filters and pagination
      const result = await shipmentService.getShipmentsByUser(
        auth.user!.userId,
        options
      );

      return this.success(result, 'Shipments retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'list shipments');
    }
  }

  /**
   * Get a single shipment by ID
   * GET /api/shipments/[id]
   */
  async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Shipment');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Check if we should include customer details
      const queryParams = this.getQueryParams(request);
      const includeCustomer = queryParams.includeCustomer === 'true';

      // Get shipment
      const result = includeCustomer
        ? await shipmentService.getShipmentWithCustomer(params.id, auth.user!.userId)
        : await shipmentService.getShipmentById(params.id, auth.user!.userId);

      if (!result) {
        return this.notFound('Shipment not found');
      }

      return this.success(result, 'Shipment retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'get shipment');
    }
  }

  /**
   * Create a new shipment
   * POST /api/shipments
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Create Shipment');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(createShipmentSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Create shipment
      const result = await shipmentService.createShipment(
        auth.user!.userId,
        {
          customerId: data.customerId,
          type: data.type,
          mode: data.mode,
          startLocation: data.startLocation,
          endLocation: data.endLocation,
          cost: data.cost,
          calculatedTotal: data.calculatedTotal,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        }
      );

      const response = this.success(result, 'Shipment created successfully');
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      return this.handleError(error, 'create shipment');
    }
  }

  /**
   * Update a shipment
   * PUT /api/shipments/[id]
   */
  async update(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Update Shipment');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(updateShipmentSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Convert dates if present
      const updateData: any = { ...data };
      if (data.deliveryDate) {
        updateData.deliveryDate = new Date(data.deliveryDate);
      }

      // Update shipment (note: userId comes second in service method)
      const result = await shipmentService.updateShipment(
        params.id,
        auth.user!.userId,
        updateData
      );

      return this.success(result, 'Shipment updated successfully');
    } catch (error) {
      return this.handleError(error, 'update shipment');
    }
  }

  /**
   * Delete a shipment
   * DELETE /api/shipments/[id]
   */
  async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Delete Shipment');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Delete shipment
      await shipmentService.deleteShipment(params.id, auth.user!.userId);

      return this.success(null, 'Shipment deleted successfully');
    } catch (error) {
      return this.handleError(error, 'delete shipment');
    }
  }

  /**
   * Mark shipment as delivered
   * PATCH /api/shipments/[id]/deliver
   */
  async markDelivered(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Mark Shipment as Delivered');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse body for optional deliveryDate
      let deliveryDate: Date | undefined;
      try {
        const body = await this.parseBody(request);
        if (body.deliveryDate) {
          deliveryDate = new Date(body.deliveryDate);
        }
      } catch {
        // No body provided, use current date
      }

      // Mark as delivered
      const result = await shipmentService.markAsDelivered(
        params.id,
        auth.user!.userId,
        deliveryDate
      );

      return this.success(result, 'Shipment marked as delivered');
    } catch (error) {
      return this.handleError(error, 'mark shipment as delivered');
    }
  }

  /**
   * Get pending shipments
   * GET /api/shipments/pending
   */
  async getPending(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Pending Shipments');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get pagination params
      const params = this.getQueryParams(request);
      const pagination = this.getPaginationParams(params);

      // Get pending shipments
      const result = await shipmentService.getPendingShipments(auth.user!.userId);

      return this.success(result, 'Pending shipments retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'get pending shipments');
    }
  }

  /**
   * Get delivered shipments
   * GET /api/shipments/delivered
   */
  async getDelivered(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Delivered Shipments');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get pagination params
      const params = this.getQueryParams(request);
      const pagination = this.getPaginationParams(params);

      // Get delivered shipments
      const result = await shipmentService.getDeliveredShipments(auth.user!.userId);

      return this.success(result, 'Delivered shipments retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'get delivered shipments');
    }
  }

  /**
   * Get shipment statistics
   * GET /api/shipments/stats
   */
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Get Shipment Stats');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Get statistics
      const result = await shipmentService.getShipmentStats(auth.user!.userId);

      return this.success(result, 'Statistics retrieved successfully');
    } catch (error) {
      return this.handleError(error, 'get shipment stats');
    }
  }

  /**
   * Bulk delete shipments
   * DELETE /api/shipments/bulk
   */
  async bulkDelete(request: NextRequest): Promise<NextResponse> {
    try {
      this.logRequest(request, 'Bulk Delete Shipments');

      // Require authentication
      const auth = await this.requireAuth(request);
      if (!auth.authenticated) {
        return auth.response!;
      }

      // Parse and validate body
      const body = await this.parseBody(request);
      const validation = this.validateBody(bulkDeleteShipmentsSchema, body);

      if (!validation.valid) {
        return validation.response!;
      }

      const data = validation.data!;

      // Bulk delete
      const deletedCount = await shipmentService.bulkDeleteShipments(
        data.ids,
        auth.user!.userId
      );

      return this.success(
        { deleted: deletedCount },
        `Successfully deleted ${deletedCount} shipment(s)`
      );
    } catch (error) {
      return this.handleError(error, 'bulk delete shipments');
    }
  }
}

// Export singleton instance
export const shipmentController = new ShipmentController();
