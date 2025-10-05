import { NextRequest, NextResponse } from 'next/server';
import { shipmentController } from '@/lib/controllers/ShipmentController';

/**
 * GET /api/shipments/[id]
 * Get a single shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return shipmentController.getById(request, { id });
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
  return shipmentController.update(request, { id });
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
  return shipmentController.delete(request, { id });
}
