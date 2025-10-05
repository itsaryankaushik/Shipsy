import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { shipmentService } from '@/lib/services/ShipmentService';
import { successResponse, internalErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/shipments/delivered
 * Get all delivered shipments
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const shipments = await shipmentService.getDeliveredShipments(auth.user!.userId);
    return successResponse(shipments, 'Delivered shipments retrieved');
  } catch (error) {
    console.error('Get delivered shipments error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to get delivered shipments');
  }
}
