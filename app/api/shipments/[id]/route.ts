import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments/[id]
 * Get a single shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return shipmentController.getById(request, params);
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return shipmentController.update(request, params);
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return shipmentController.delete(request, params);
}
