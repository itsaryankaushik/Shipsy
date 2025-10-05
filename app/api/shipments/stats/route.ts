import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { shipmentService } from '@/lib/services/ShipmentService';
import { successResponse, internalErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/shipments/stats
 * Get shipment statistics (total, pending, delivered, revenue, etc.)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const stats = await shipmentService.getShipmentStats(auth.user!.userId);
    return successResponse(stats, 'Shipment stats retrieved');
  } catch (error) {
    console.error('Get shipment stats error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to get shipment stats');
  }
}
