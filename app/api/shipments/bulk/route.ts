import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * DELETE /api/shipments/bulk
 * Bulk delete shipments by IDs
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return shipmentController.bulkDelete(request);
}
