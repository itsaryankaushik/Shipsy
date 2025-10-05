import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments/pending
 * Get all pending (not delivered) shipments
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return shipmentController.getPending(request);
}
