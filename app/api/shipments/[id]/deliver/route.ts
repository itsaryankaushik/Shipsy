import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * PATCH /api/shipments/[id]/deliver
 * Mark a shipment as delivered
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return shipmentController.markDelivered(request, params);
}
