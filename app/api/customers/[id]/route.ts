import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/CustomerService';
import { updateCustomerSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, notFoundResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/customers/[id]
 * Get a single customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const customer = await customerService.getCustomerById(id, auth.user!.userId);
    if (!customer) return notFoundResponse('Customer not found');

    return successResponse(customer, 'Customer retrieved successfully');
  } catch (error) {
    console.error('Get customer error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to get customer');
  }
}

/**
 * PUT /api/customers/[id]
 * Update a customer
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
    const parsed = updateCustomerSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const customer = await customerService.updateCustomer(id, auth.user!.userId, parsed.data);
    return successResponse(customer, 'Customer updated successfully');
  } catch (error) {
    console.error('Update customer error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to update customer');
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    await customerService.deleteCustomer(id, auth.user!.userId);
    return successResponse(null, 'Customer deleted successfully');
  } catch (error) {
    console.error('Delete customer error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to delete customer');
  }
}
