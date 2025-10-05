import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments/stats
 * Get shipment statistics (total, pending, delivered, revenue, etc.)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return shipmentController.getStats(request);
}
