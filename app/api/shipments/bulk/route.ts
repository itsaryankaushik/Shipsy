import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { bulkDeleteShipmentsSchema } from '@/lib/validators';
import { shipmentService } from '@/lib/services/ShipmentService';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * DELETE /api/shipments/bulk
 * Bulk delete shipments by IDs
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const body = await request.json();
    const parsed = bulkDeleteShipmentsSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const ids = parsed.data.ids;
    const deletedCount = await shipmentService.bulkDeleteShipments(ids, auth.user!.userId);
    return successResponse({ deleted: deletedCount }, 'Bulk delete completed');
  } catch (error) {
    console.error('Bulk delete error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to bulk delete shipments');
  }
}
