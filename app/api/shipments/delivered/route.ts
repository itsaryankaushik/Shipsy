import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments/delivered
 * Get all delivered shipments
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return shipmentController.getDelivered(request);
}
