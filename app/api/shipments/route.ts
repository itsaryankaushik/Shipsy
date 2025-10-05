import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments
 * List all shipments with filters and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return shipmentController.list(request);
}

/**
 * POST /api/shipments
 * Create a new shipment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return shipmentController.create(request);
}
