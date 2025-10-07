import { NextRequest, NextResponse } from 'next/server';
import { shipmentService } from '@/lib/services/ShipmentService';
import { updateShipmentSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, notFoundResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/shipments/[id]
 * Get a single shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const url = new URL(request.url);
    const includeCustomer = url.searchParams.get('includeCustomer') === 'true';

    const result = includeCustomer
      ? await shipmentService.getShipmentWithCustomer(id, auth.user!.userId)
      : await shipmentService.getShipmentById(id, auth.user!.userId);

    if (!result) return notFoundResponse('Shipment not found');
    return successResponse(result, 'Shipment retrieved successfully');
  } catch (error) {
    console.error('Get shipment error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to get shipment');
  }
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const body = await request.json();
    const parsed = updateShipmentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const data = parsed.data;
    const updateData: any = { ...data };
    if (data.estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(data.estimatedDeliveryDate);
    
    const result = await shipmentService.updateShipment(id, auth.user!.userId, updateData);
    return successResponse(result, 'Shipment updated successfully');
  } catch (error) {
    console.error('Update shipment error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to update shipment');
  }
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    await shipmentService.deleteShipment(id, auth.user!.userId);
    return successResponse(null, 'Shipment deleted successfully');
  } catch (error) {
    console.error('Delete shipment error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to delete shipment');
  }
}
