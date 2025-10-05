import { NextRequest, NextResponse } from 'next/server';
import { shipmentService } from '@/lib/services/ShipmentService';
import { listShipmentsSchema, createShipmentSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/shipments
 * List all shipments with filters and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));

    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = Math.min(params.limit ? parseInt(params.limit, 10) : 20, 100);

    // Coerce enums/casing handled by validators if needed
    const result = await shipmentService.getShipmentsByUser(auth.user!.userId, {
      page,
      limit,
      type: params.type as any,
      mode: params.mode as any,
      isDelivered: params.isDelivered === 'true' ? true : params.isDelivered === 'false' ? false : undefined,
      customerId: params.customerId,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      search: params.search,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    });

    const payload = { items: result.shipments, meta: result.meta };
    return successResponse(payload, 'Shipments retrieved successfully');
  } catch (error) {
    console.error('List shipments error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to list shipments');
  }
}

/**
 * POST /api/shipments
 * Create a new shipment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const body = await request.json();
    const parsed = createShipmentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const data = parsed.data;

    const result = await shipmentService.createShipment(auth.user!.userId, {
      customerId: data.customerId,
      type: data.type,
      mode: data.mode,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      cost: data.cost,
      calculatedTotal: data.calculatedTotal,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
    });

    return NextResponse.json(successResponse(result, 'Shipment created successfully'), { status: 201 });
  } catch (error) {
    console.error('Create shipment error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to create shipment');
  }
}
