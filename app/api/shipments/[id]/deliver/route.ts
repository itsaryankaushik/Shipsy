import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { markDeliveredSchema } from '@/lib/validators';
import { shipmentService } from '@/lib/services/ShipmentService';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * PATCH /api/shipments/[id]/deliver
 * Mark a shipment as delivered
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const body = await request.json();
    const parsed = markDeliveredSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

  const data = parsed.data;
  await shipmentService.markAsDelivered(id, auth.user!.userId, data.deliveryDate ? new Date(data.deliveryDate) : new Date());
    return successResponse(null, 'Shipment marked delivered');
  } catch (error) {
    console.error('Mark delivered error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to mark delivered');
  }
}
